import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '@/server';
import { format, parse } from 'date-fns';

export const slotsRouter = createTRPCRouter({
  list: publicProcedure
    .input(z.object({
      schedule: z.number().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      let query = ctx.supabase
        .from('slots')
        .select('*, schedule:schedule!schedule(*)');

      if (input?.schedule) {
        query = query.eq('schedule', input.schedule);
      }

      const { data, error } = await query.order('start_time');

      if (error) throw error;
      return data;
    }),

  getById: publicProcedure
    .input(z.number())
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('slots')
        .select('*, schedule:schedule!schedule(*)')
        .eq('id', input)
        .single();

      if (error) throw error;
      return data;
    }),

  create: publicProcedure
    .input(z.object({
      start: z.string().min(1, "Start time is required"),
      end: z.string().min(1, "End time is required"),
      schedule: z.number().min(1, "Schedule is required"),
      start_time: z.string().nullable(),
      end_time: z.string().nullable(),
      size: z.coerce.number().min(1, "Capacity is required"),
    }))
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('slots')
        .insert(input)
        .select('*, schedule:schedule!schedule(*)')
        .single();

      if (error) throw error;
      return data;
    }),

  update: publicProcedure
    .input(z.object({
      schedule: z.number(),
      data: z.array(
        z.object({
          start: z.string().min(1, "Start time is required").optional(),
          end: z.string().min(1, "End time is required").optional(),
          start_time: z.string().nullable().optional(),
          end_time: z.string().nullable().optional(),
          size: z.coerce.number().min(1, "Capacity is required").optional(),
        })
      ),
    }))
    .mutation(async ({ ctx, input }) => {

      console.log(input);
      
      await ctx.supabase
        .from('slots')
        .delete()
        .eq('schedule', input.schedule);

      if (input.data.length === 0) {
        return true;
      }

      const payload = input.data.map((slot: any) => ({
        ...slot,
        start: slot.start ? format(parse(slot.start, 'HH:mm', new Date()), 'HH:mm') : slot.start,
        end: slot.end ? format(parse(slot.end, 'HH:mm', new Date()), 'HH:mm') : slot.end,
        schedule: input.schedule,
        start_time: slot.start ? format(parse(slot.start, 'HH:mm', new Date()), "yyyy-MM-dd'T'HH:mm:ss") : null,
        end_time: slot.end ? format(parse(slot.end, 'HH:mm', new Date()), "yyyy-MM-dd'T'HH:mm:ss") : null,
      }));

      await ctx.supabase
        .from('slots')
        .insert(payload)
        .select();

      return true;
    }),

  delete: publicProcedure
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      const { error } = await ctx.supabase
        .from('slots')
        .delete()
        .eq('id', input);

      if (error) throw error;
      return true;
    }),

  createMultiple: publicProcedure
    .input(z.object({
      schedule: z.number().min(1, "Schedule is required"),
      slots: z.array(z.object({
        start: z.string().min(1, "Start time is required"),
        end: z.string().min(1, "End time is required"),
        size: z.coerce.number().min(1, "Capacity is required"),
      })),
    }))
    .mutation(async ({ ctx, input }) => {
      const slotsWithSchedule = input.slots.map(slot => ({
        ...slot,
        schedule: input.schedule,
        start_time: slot.start ? format(parse(slot.start, 'HH:mm', new Date()), "yyyy-MM-dd'T'HH:mm:ss") : null,
        end_time: slot.end ? format(parse(slot.end, 'HH:mm', new Date()), "yyyy-MM-dd'T'HH:mm:ss") : null,
      }));

      const { data, error } = await ctx.supabase
        .from('slots')
        .insert(slotsWithSchedule)
        .select('*, schedule:schedule!schedule(*)');

      if (error) throw error;
      return data;
    }),
});
