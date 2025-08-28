import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/server'; 

export const bookingRouter = createTRPCRouter({
  list: protectedProcedure
    .input(z.object({
      facility: z.number().optional(),
      date: z.string().optional(),
      schedule: z.number().optional(),
      user: z.string().uuid().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      let query = ctx.supabase
        .from('bookings')
        .select(`
          *,
          facility(*),
          schedule(*),
          slot:slots(*),
          approved_by(*)
        `);

      if (input?.facility) {
        query = query.eq('facility', input.facility);
      }

      if (input?.date) {
        query = query.eq('date', input.date);
      }

      if (input?.schedule) {
        query = query.eq('schedule', input.schedule);
      }

      if (input?.user) {
        query = query.eq('user', input.user);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    }),

  getById: protectedProcedure
    .input(z.object({
      schedule: z.number(),
      slot: z.number(),
      facility: z.number(),
      date: z.string(),
      user: z.string().uuid(),
    }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('bookings')
        .select(`
          *,
          facility(*),
          schedule(*),
          slot:slots(*),
          approved_by(*)
        `)
        .eq('schedule', input.schedule)
        .eq('slot', input.slot)
        .eq('facility', input.facility)
        .eq('date', input.date)
        .eq('user', input.user)
        .single();

      if (error) throw error;
      return data;
    }),

  create: protectedProcedure
    .input(z.object({
      schedule: z.number(),
      slot: z.number(),
      facility: z.number(),
      date: z.string(),
      status: z.string().nullable(),
      description: z.string().nullable(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('bookings')
        .insert({
          ...input,
          user: ctx.session.user?.id,
        })
        .select(`
          *,
          facility(*),
          schedule(*),
          slot:slots(*),
          approved_by(*)
        `)
        .single();

      if (error) throw error;
      return data;
    }),

  update: protectedProcedure
    .input(z.object({
      schedule: z.number(),
      slot: z.number(),
      facility: z.number(),
      date: z.string(),
      user: z.string().uuid(),
      data: z.object({
        status: z.string().nullable().optional(),
        description: z.string().nullable().optional(),
        approved_by: z.string().uuid().nullable().optional(),
        approved_at: z.string().nullable().optional(),
      }),
    }))
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('bookings')
        .update(input.data)
        .eq('schedule', input.schedule)
        .eq('slot', input.slot)
        .eq('facility', input.facility)
        .eq('date', input.date)
        .eq('user', input.user)
        .select(`
          *,
          facility(*),
          schedule(*),
          slot:slots(*),
          approved_by(*)
        `)
        .single();

      if (error) throw error;
      return data;
    }),

  delete: protectedProcedure
    .input(z.object({
      schedule: z.number(),
      slot: z.number(),
      facility: z.number(),
      date: z.string(),
      user: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { error } = await ctx.supabase
        .from('bookings')
        .delete()
        .eq('schedule', input.schedule)
        .eq('slot', input.slot)
        .eq('facility', input.facility)
        .eq('date', input.date)
        .eq('user', input.user);

      if (error) throw error;
      return true;
    }),

  approve: protectedProcedure
    .input(z.object({
      schedule: z.number(),
      slot: z.number(),
      facility: z.number(),
      date: z.string(),
      user: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('bookings')
        .update({
          status: 'approved',
          approved_by: ctx.session.user?.id,
          approved_at: new Date().toISOString(),
        })
        .eq('schedule', input.schedule)
        .eq('slot', input.slot)
        .eq('facility', input.facility)
        .eq('date', input.date)
        .eq('user', input.user)
        .select(`
          *,
          facility(*),
          schedule(*),
          slot:slots(*),
          approved_by(*)
        `)
        .single();

      if (error) throw error;
      return data;
    }),

  reject: protectedProcedure
    .input(z.object({
      schedule: z.number(),
      slot: z.number(),
      facility: z.number(),
      date: z.string(),
      user: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('bookings')
        .update({
          status: 'rejected',
          approved_by: ctx.session.user.id,
          approved_at: new Date().toISOString(),
        })
        .eq('schedule', input.schedule)
        .eq('slot', input.slot)
        .eq('facility', input.facility)
        .eq('date', input.date)
        .eq('user', input.user)
        .select(`
          *,
          facility(*),
          schedule(*),
          slot:slots(*),
          approved_by(*)
        `)
        .single();

      if (error) throw error;
      return data;
    }),
});