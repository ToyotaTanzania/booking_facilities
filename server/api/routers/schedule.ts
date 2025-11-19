import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '@/server';
import { format, parse } from 'date-fns';

export const scheduleRouter = createTRPCRouter({
  list: publicProcedure
    .query(async ({ ctx }) => {
      const { data, error } = await ctx.supabase
        .from('schedule')
        .select(`
          *,
          slots:slots!schedule(*)
        `)
        .order('name');

      if (error) throw error;
      return data;
    }),

  getScheduleWithSlotsById: publicProcedure
    .input(z.number())
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('schedule')
        .select(`
          *,
          slots:slots!schedule(*)
        `)
        .eq('id', input)
        .single();

      if (error) throw error;
      return data;  
    }),

  getScheduleWithSlots: publicProcedure
    .query(async ({ ctx }) => {
      const { data, error } = await ctx.supabase
        .from('schedule')
        .select(`
          *,
          slots:slots!schedule(*)
        `)
        .order('name');

      if (error) throw error;
      return data;  
    }),

  getById: publicProcedure
    .input(z.number())
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('schedule')
        .select(`
          *,
          slots:slots!schedule(*)
        `)
        .eq('id', input)
        .single();

      if (error) throw error;
      return data;
    }),

    

  create: publicProcedure
    .input(z.object({
      name: z.string().min(1, "Name is required"),
      start_time: z.string().optional(),
      end_time: z.string().optional(),
      facility: z.number().nullable().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('schedule')
        .insert(input)
        .select()
        .single();

      if (error) throw error;
      return data;
    }),

  createWithSlots: publicProcedure
    .input(z.object({
      name: z.string().min(1, "Name is required"),
      slots: z.array(z.object({
        start: z.string().min(1, "Start time is required"),
        end: z.string().min(1, "End time is required"),
        size: z.coerce.number().min(1, "Capacity is required"),
      })),
    }))
    .mutation(async ({ ctx, input }) => {
      // Create the schedule first
      const { data: schedule, error: scheduleError } = await ctx.supabase
        .from('schedule')
        .insert({ name: input.name })
        .select()
        .single();

      if (scheduleError) throw scheduleError;

      // Create the slots with proper timestamp formatting
      if (input.slots && input.slots.length > 0) {
        const { data: slots, error: slotsError } = await ctx.supabase
          .from('slots')
          .insert(input.slots.map((slot: any) => ({
            schedule: schedule.id,
            start: slot.start,
            end: slot.end,
            start_time: slot.start ? format(parse(slot.start, 'HH:mm', new Date()), "yyyy-MM-dd'T'HH:mm:ss") : null,
            end_time: slot.end ? format(parse(slot.end, 'HH:mm', new Date()), "yyyy-MM-dd'T'HH:mm:ss") : null,
            size: slot.size,
          })))
          .select();

        if (slotsError) throw slotsError;

        return {
          schedule,
          slots,
        };
      }

      return {
        schedule,
        slots: [],
      };
    }),

  update: publicProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      start_time: z.string().optional(),
      end_time: z.string().optional(),
      facility: z.number().nullable().optional(),
      slots: z.array(z.object({
        start: z.string().min(1, "Start time is required").optional(),
        end: z.string().min(1, "End time is required").optional(),
        size: z.coerce.number().min(1, "Capacity is required").optional(),
      })).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const updateData: any = {};
      if (input.name) updateData.name = input.name;
      if (input.start_time) updateData.start_time = input.start_time;
      if (input.end_time) updateData.end_time = input.end_time;
      if (input.facility !== undefined) updateData.facility = input.facility;

      if (Object.keys(updateData).length > 0) {
        const { error } = await ctx.supabase
          .from('schedule')
          .update(updateData)
          .eq('id', input.id);

        if (error) throw error;
      }

      if (input.slots && input.slots.length > 0) {
        await ctx.supabase
          .from('slots')
          .delete()
          .eq('schedule', input.id);

        const { data, error } = await ctx.supabase
          .from('slots')
          .insert(input.slots.map((slot: any) => ({
            schedule: input.id,
            start: slot.start,
            end: slot.end,
            start_time: slot.start ? format(parse(slot.start, 'HH:mm', new Date()), "yyyy-MM-dd'T'HH:mm:ss") : null,
            end_time: slot.end ? format(parse(slot.end, 'HH:mm', new Date()), "yyyy-MM-dd'T'HH:mm:ss") : null,
            size: slot.size,
          })))
          .select();

        if (error) throw error;
        return data;
      } else {
        await ctx.supabase
          .from('slots')
          .delete()
          .eq('schedule', input.id);
      }
    }),

  delete: publicProcedure
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      // Check if schedule has any slots
      const { data: slots } = await ctx.supabase
        .from('slots')
        .select('id')
        .eq('schedule', input)
        .limit(1);

      if (slots && slots.length > 0) {
        throw new Error("Cannot delete schedule with existing slots. Use deleteWithSlots to remove both schedule and slots.");
      }

      const { error } = await ctx.supabase
        .from('schedule')
        .delete()
        .eq('id', input);

      if (error) throw error;
      return true;
    }),

  deleteWithSlots: publicProcedure
    .input(z.object({
      id: z.number(),
      force: z.boolean().optional().default(false),
    }))
    .mutation(async ({ ctx, input }) => {
      // First, delete all associated slots
      const { error: slotsError } = await ctx.supabase
        .from('slots')
        .delete()
        .eq('schedule', input.id);

      if (slotsError) throw slotsError;

      // Then delete the schedule
      const { error: scheduleError } = await ctx.supabase
        .from('schedule')
        .delete()
        .eq('id', input.id);

      if (scheduleError) throw scheduleError;

      return {
        success: true,
        message: "Schedule and all associated slots deleted successfully",
        deletedScheduleId: input.id,
      };
    }),

  deleteSlotsOnly: publicProcedure
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      // Delete only the slots for a schedule, keeping the schedule
      const { error } = await ctx.supabase
        .from('slots')
        .delete()
        .eq('schedule', input.id);

      if (error) throw error;

      return {
        success: true,
        message: "All slots for the schedule have been removed",
        scheduleId: input.id,
      };
    }),

  getByFacility: publicProcedure
    .input(z.number())
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('schedule')
        .select(`
          *,
          slots:slots!schedule(*)
        `)
        .eq('facility', input)
        .order('name');

      if (error) throw error;
      return data;
    }),
});
