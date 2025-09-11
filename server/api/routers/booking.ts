import { date, z } from 'zod';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '@/server'; 
import { endOfYear, startOfYear } from 'date-fns';

export const bookingRouter = createTRPCRouter({

    create: protectedProcedure
    .input(
      z.object({
        slots: z.array(z.number()),
        date: z.string(),
        schedule: z.number(),
        facility: z.number(),
      })
    ).mutation( 
      async ({ input, ctx }) => { 

        const { slots, date, schedule, facility } = input

        const { data, error } = await ctx.supabase
        .from('bookings')
        .insert(slots.map(slot => ({
          slot: slot,
          date: date,
          schedule: schedule,
          facility: facility,
          user: ctx.session.supabase.sub,
          description: ctx.session.user.email,
          status: 'pending'
        })))

        if (error) {
          console.log(error)
          throw new Error(error.message)
        }

        return data
      }
    ),

    getBookings: protectedProcedure.input(z.object({
        date: z.string(),
        facility: z.union([z.string(), z.number()]),
    })).query(async ({ input, ctx }) => {
        
      const { data, error } = await ctx.supabase
      .from('bookings')
      .select('*')
      .eq('facility', typeof input.facility === 'number' ? input.facility : +input.facility)
      .eq('date', input.date)


      if (error) {
        throw new Error(error.message)
      }

      return data
    }),


    getCalendarBookings: publicProcedure.query(async ({ ctx }) => {
      
      const { data, error } = await ctx.supabase
      .from('bookings')
      .select('*, user:profiles(*), slot:slots(*), facility:facilities(*)')
      // .between('date', [startOfYear(new Date(input.date)).toISOString(), endOfYear(new Date(input.date)).toISOString()])
      .lt('date', endOfYear(new Date()).toISOString())
      .gt('date', startOfYear(new Date()).toISOString())
      // .eq('status', 'confirmed')
      
      if (error) {
        throw new Error(error.message)
      }

      return data
    }),


    accept: protectedProcedure
    .input(z.object({
      slot: z.number(),
      facility: z.number(),
      date: z.string(),
      schedule: z.number(),
      comment: z.string().optional(),
    })).mutation(async ({ input, ctx }) => {
      const { facility, slot, date, comment } = input

      const { data, error } = await ctx.supabase
      .from('bookings')
      .update({ status: 'confirmed', 
        approved_by: ctx.session.supabase.sub, 
        approved_at: new Date().toISOString(), 
        comment: comment 
      })
      .eq('facility', facility)
      .eq('date', new Date(date).toISOString())
      .eq('slot', slot)

      if (error) {
        throw new Error(error.message)
      }

      return data
    }),

    reject: protectedProcedure
    .input(z.object({
      slot: z.number(),
      facility: z.number(),
      date: z.string(),
      comment: z.string().optional(),
    })).mutation(async ({ input, ctx }) => {
      const { facility, slot, date, comment } = input

      const { data, error } = await ctx.supabase
      .from('bookings')
      .update({ 
        status: 'rejected', 
        approved_by: ctx.session.supabase.sub, 
        approved_at: new Date().toISOString(), 
        comment: comment 
      })
      .eq('facility', facility)
      .eq('date', new Date(date).toISOString())
      .eq('slot', slot)

    if (error) {
        throw new Error(error.message)
    }

    return data
  }),

  changeUser: protectedProcedure
  .input(z.object({
    slot: z.number(),
    facility: z.number(),
    date: z.string(),
    user: z.string(), 
    comment: z.string().optional(),
  })).mutation(async ({ input, ctx }) => {
    const { facility, date, slot, user, comment } = input

  const { data, error } = await ctx.supabase
    .from('bookings')
    .update({
      user: user,
      comment: comment
     })
    .eq('facility', facility)
    .eq('date', new Date(date).toISOString())
    .eq('slot', slot)

    if (error) {
      throw new Error(error.message)
    }

    return data
  }),

  cancel: protectedProcedure
  .input(z.object({
    id: z.number(),
    comment: z.string().optional(),
  })).mutation(async ({ input, ctx }) => {
    const { id, date, comment } = input

  const { data, error } = await ctx.supabase
    .from('bookings')
    .update({ status: 'cancelled',
      approved_by: ctx.session.supabase.sub, 
      approved_at: new Date().toISOString(), 
      comment: comment, 
    })
    .eq('id', id)

    if (error) {
      throw new Error(error.message)
    }

    return data
  }),


  changeDate: protectedProcedure
  .input(z.object({
    id: z.number(),
    date: z.string(),
    comment: z.string().optional(),
  })).mutation(async ({ input, ctx }) => {
    const { id, date, comment } = input

  const { data, error } = await ctx.supabase
    .from('bookings')
    .update({ status: 'pending',
      approved_by: ctx.session.supabase.sub, 
      approved_at: new Date().toISOString(), 
      comment: comment, 
      date: date 
    })
    .eq('id', id)

    if (error) {
      throw new Error(error.message)
    }

    return data
  }),


  rescheduleAndConfirm: protectedProcedure
  .input(z.object({
    id: z.number(),
    date: z.string(),
    slot: z.number(),
    comment: z.string().optional(),
  })).mutation(async ({ input, ctx }) => {
    const { id, date, slot, comment } = input

  const { data, error } = await ctx.supabase
    .from('bookings')
    .update({ status: 'confirmed',
      approved_by: ctx.session.supabase.sub, 
      approved_at: new Date().toISOString(), 
      comment: comment, 
      date: date,
      slot: slot
    })
    .eq('id', id)

    if (error) {
      throw new Error(error.message)
    }

    return data
  }),
});