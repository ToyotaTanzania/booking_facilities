import { z } from 'zod';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '@/server'; 
import { endOfYear, format, startOfYear } from 'date-fns';
import { render } from '@react-email/components';
import BookingConfirmationEmail from '@/emails/notify';
import { v4 as uuidv4 } from 'uuid';

export const bookingRouter = createTRPCRouter({

    getMyBookings: 
    protectedProcedure
    .query(async ({ ctx }) => { 
      const { data, error } = await ctx.supabase
      .from('bookings')
      .select('*, slot:slots(*), facility:facilities(*, building(*)), user:profiles(*)')
      .eq('user', ctx.session.user.id)
      .order('date', { ascending: false })

      if (error) {
        throw new Error(error.message)
      }

      return data
    }),

    create: protectedProcedure
    .input(
      z.object({
        slots: z.array(z.number()),
        date: z.string(),
        schedule: z.number(),
        facility: z.number(),
        startsAt: z.string().optional(),
        endsAt: z.string().optional(),
      })
    ).mutation( 
      async ({ input, ctx }) => { 

        const { slots, date, schedule, facility, startsAt, endsAt } = input
        const uuid = uuidv4()

        const mailer = ctx.mailer;

        const user = ctx.session.supabase.user

        const { data, error } = await ctx.supabase
        .from('bookings')
        .insert(slots.map(slot => ({
          slot: slot,
          date: date,
          schedule: schedule,
          facility: facility,
          user: user.id,
          description: user.email,
          status: 'pending',
          code: uuid
        })))

        if (error) {
          throw new Error(error.message)
        }

        const { data: responsible } = await ctx.supabase
        .from("responsible_person")
        .select("*, facility(*, building(*))")
        .eq("facility", typeof facility === 'number' ? facility : +facility)
        .single();

        if (responsible) {

          const { facility, name, email, phone } = responsible

          // Render email HTML without JSX (file is .ts)
          const emailHtml = await render(
            BookingConfirmationEmail({
              username: name ?? "",
              facilityName: `${facility?.name}-${facility?.building?.name}-${facility?.building?.location}`,
              startsAt: startsAt ?? "",
              endsAt: endsAt ?? "",
              // date: date ?? "",
              date: format(new Date(date), "EEEE d, MMMM yyyy" /*, { locale: enUS }*/),
              requester: ctx.session.user.name ?? "",
              bookingsUrl: "https://boardrooms.karimjee.com/bookings",
            })
          );

          const options = {
            from: "no-reply@karimjee.com",
            to: responsible.email,
            subject: `New booking request for ${responsible?.facility?.name}-${facility.building.name}-${facility.building.location}`,
            html: emailHtml,
          };

          mailer.sendMail(options);
        }

        return data
      }
    ),

    getBookings: publicProcedure.input(z.object({
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

    getPendingByFacility: protectedProcedure
      .input(z.number())
      .query(async ({ input, ctx }) => {
        const facilityId = input;
        const { data, error } = await ctx.supabase
          .from('bookings')
          .select('*, slot:slots(*), user:profiles(*), facility:facilities(*, building(*))')
          .eq('facility', facilityId)
          .eq('status', 'pending')
          .order('date', { ascending: false });

        if (error) {
          throw new Error(error.message)
        }

        return data;
      }),


    getCalendarBookings: publicProcedure.query(async ({ ctx }) => {
      
      const { data, error } = await ctx.supabase
      .from('bookings')
      .select('*, user:profiles(*), slot:slots(*), facility:facilities(*, building(*))')
      // .between('date', [startOfYear(new Date(input.date)).toISOString(), endOfYear(new Date(input.date)).toISOString()])
      .lt('date', endOfYear(new Date()).toISOString())
      .gt('date', startOfYear(new Date()).toISOString())
      // .eq('status', 'confirmed')

      const { data: responsible, error: responsibleError } = await ctx.supabase.from("responsible_person").select("*");
      const { data: bookingSlots } = await ctx.supabase.from("slots").select("*");
      
      if (error) {
        throw new Error(error.message)
      }

      return data?.map(booking => {
        const responsiblePerson = responsible?.find(rp => rp.facility === booking.facility.id);
        return {
          ...booking,
          responsiblePerson: responsiblePerson || null,
          slots: bookingSlots?.filter(slot => slot.schedule === booking.schedule) || [],
        }}
      );  
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
        approved_by: ctx.session.user.id, 
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
        approved_by: ctx.session.user.id, 
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
    description: z.string().optional(),
    comment: z.string().optional(),
  })).mutation(async ({ input, ctx }) => {
    const { facility, date, slot, user, comment } = input

  const { data, error } = await ctx.supabase
    .from('bookings')
    .update({
      user: user,
      comment: comment,
      description: input.description ?? "",
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
      approved_by: ctx.session.user.id, 
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
      approved_by: ctx.session.user.id, 
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
      approved_by: ctx.session.user.id, 
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


  remove: protectedProcedure
  .input(z.object({
    id: z.number(),
  }))
  .mutation(async ({ input, ctx }) => { 
    const { id } = input

    const { data, error } = await ctx.supabase
    .from('bookings')
    .delete()
    .eq('id', id)

    if (error) {
      throw new Error(error.message)
    }

    return data
  })
});