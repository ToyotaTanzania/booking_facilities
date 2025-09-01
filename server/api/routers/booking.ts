import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/server'; 

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


    accept: protectedProcedure
    .input(z.object({
      id: z.number(),
      comment: z.string().optional(),
    })).mutation(async ({ input, ctx }) => {
      const { id, comment } = input

      const { data, error } = await ctx.supabase
      .from('bookings')
      .update({ status: 'confirmed', 
        approved_by: ctx.session.supabase.sub, 
        approved_at: new Date().toISOString(), 
        comment: comment 
      })
      .eq('id', id)

      if (error) {
        throw new Error(error.message)
      }

      return data
    }),

    reject: protectedProcedure
    .input(z.object({
      id: z.number(),
      comment: z.string().optional(),
    })).mutation(async ({ input, ctx }) => {
      const { id, comment } = input

      const { data, error } = await ctx.supabase
      .from('bookings')
      .update({ status: 'rejected', approved_by: ctx.session.supabase.sub, approved_at: new Date().toISOString(), comment: comment })
      .eq('id', id)

    if (error) {
        throw new Error(error.message)
    }

    return data
  }),

  changeUser: protectedProcedure
  .input(z.object({
    id: z.number(),
    user: z.string(),
    comment: z.string().optional(),
  })).mutation(async ({ input, ctx }) => {
    const { id, user, comment } = input

  const { data, error } = await ctx.supabase
    .from('bookings')
    .update({ status: 'confirmed',
      approved_by: ctx.session.supabase.sub, 
      approved_at: new Date().toISOString(), 
      comment: comment, 
      user: user 
    })
    .eq('id', id)
    .eq('user', user)

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