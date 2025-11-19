import { z } from 'zod';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '@/server'; 
import { endOfYear, format, startOfYear } from 'date-fns';
import { render } from '@react-email/components';
import BookingConfirmationEmail from '@/emails/notify';
import { v4 as uuidv4 } from 'uuid';
import { setDate, setHours, setMinutes, set, isDate} from 'date-fns'

import _ from 'lodash'
import { eventSchema } from '@/calendar/schemas';

const ExtractTime = (input: string) => {
  const split = input.split(':');
  return split
}

const setDateTime = (date: string, time: string) => {
  const [ hour, minute ] = time.split(':');
  const dateObj = set(new Date(date), {
    hours: +hour!,
    minutes: +minute!,
    seconds: 0,
    milliseconds: 0,
  })
  return format(dateObj, 'yyyy-MM-dd HH:mm:ss')
}

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

        const user = ctx.session.user

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

    guestBooking: publicProcedure
    .input(eventSchema)
    .mutation(async ({ input, ctx }) => {

      const code = uuidv4()

      const bookings = input.slots.map(slot => ({
        slot: slot,
        date: input.date,
        schedule: input.schedule,
        facility: input.room,
        user: null,
        description: input.title ?? input.email ?? input.phone ?? "",
        status: 'pending',
        code: code,
        name: input.name ?? "",
        email: input.email ?? "",
        phone: input.phone ?? "",
        title: input.title,
        location: input.location,
        building: input.building,
      }))

      

      const { data, error } = await ctx.supabase
      .from('bookings')
      .insert(bookings)
      
      if (error) {
        throw new Error(error.message)
      }
      return data

    }),

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

    filteredBookings: publicProcedure
      .input(
        z.object({
          date: z.string().nullable().optional(),
          interval: z.enum(['day', 'week', 'month', 'year']).optional(),
          building: z.number().nullable().optional(),
          location: z.string().nullable().optional(),
          facility: z.union([z.string(), z.number()]).nullable().optional(),
        })
      )
      .query(async ({ input, ctx }) => {

        const query = ctx.supabase
          .from('bookings')
          .select('*, user:profiles(*), slot:slots(*), facility:facilities(*, building:buildings(*))')

        if (input.facility) {
          const facilityId = typeof input.facility === 'number' ? input.facility : +input.facility;
          query.eq('facility', facilityId);
        }

        if (input.building) {
          // Filter by building through embedded relationship
          query.eq('facility.building', input.building);
        }

        if (input.location) {
          // Filter by location name on the building
          query.eq('facility.building.location', input.location);
        }

        // Date filtering by interval range
        if(input.date){
        const base = new Date(input.date);
        const startDate = format(base, 'yyyy-MM-dd');
          if (input.interval === 'week') {
          const end = new Date(base);
          end.setDate(base.getDate() + 6);
          const endDate = format(end, 'yyyy-MM-dd');
          query.gte('date', startDate).lte('date', endDate);
        } else if (input.interval === 'month') {
          const end = new Date(base);
          end.setMonth(base.getMonth() + 1);
          const endDate = format(end, 'yyyy-MM-dd');
          query.gte('date', startDate).lte('date', endDate);
        } else if (input.interval === 'year') {
          const end = new Date(base);
          end.setFullYear(base.getFullYear() + 1);
          const endDate = format(end, 'yyyy-MM-dd');
          query.gte('date', startDate).lte('date', endDate);
        } else {
          // Default to exact date
          query.eq('date', startDate);
        }
        }

        const { data, error } = await query;

        if (error) {
          throw new Error(error.message);
        }

        // Enrich bookings with computed start/end strings without constructing Date objects
        const normalizeTime = (t?: string | null) => {
          if (!t) return '08:00:00';
          const s = String(t).trim();
          if (/^\d{2}:\d{2}$/.test(s)) return `${s}:00`;
          if (/^\d{2}:\d{2}:\d{2}$/.test(s)) return s;
          const parts = s.split(':');
          const hh = (parts[0] || '08').padStart(2, '0');
          const mm = (parts[1] || '00').padStart(2, '0');
          const ss = (parts[2] || '00').padStart(2, '0');
          return `${hh}:${mm}:${ss}`;
        };



        const enriched = (data || []).map((booking: any) => {
          const rawDate = booking?.date;
          const isYmd = typeof rawDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(rawDate);
          const dateStr = isDate(rawDate) ? format(new Date(rawDate), 'yyyy-MM-dd') : rawDate;
          const start = setDateTime(dateStr, booking.slot.start);
          const end = setDateTime(dateStr, booking.slot.end);
          return { ...booking, start, end, isYmd, dateStr };
        });

        return enriched;
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
    const { id, comment } = input

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
  }),

  searchBookings: publicProcedure
  .input(z.object({
    date: z.string().nullable().optional(),
    building: z.number().nullable().optional(),
    location: z.string().nullable().optional(),
    facility: z.union([z.string(), z.number()]).nullable().optional(),
  })).query(async ({ input, ctx }) => {
    const { date, building, location, facility } = input

    console.log(input)

    const query = ctx.supabase
    .from('bookings')
    // .select('*, facility(*)')
    .select('*, slot:slots(*), facility:facilities(*, building(*)), user:profiles(*)')
    .eq('date', date)
    .or(`status.eq.confirmed,status.eq.pending`)
    .order('created_at', { ascending: false })

    if(!_.isEmpty(facility) || (_.isNumber(facility) && facility > 0)) {
      query.eq('facility', facility)
    }
    if(!_.isEmpty(building) || (_.isNumber(building) && building > 0)) {
      const { data: facilities } = await ctx.supabase
        .from('facilities')
        .select('id')
        .eq('building', building);
      const facilityIds = facilities?.map(f => f.id) ?? [];
      query.in('facility', facilityIds);
    }else if(!_.isEmpty(location)){
      const buildingQuery = ctx.supabase
      .from('buildings')
      .select('id')
      .ilike('location', `%${location}%`)
  
      const { data: buildings } = await buildingQuery
      const buildingIds = buildings?.map(b => b.id) ?? [];
      const { data: facilities } = await ctx.supabase
        .from('facilities')
        .select('id')
        .in('building', buildingIds);

        const facilityIds = facilities?.map(f => f.id) ?? [];
        query.in('facility', facilityIds);
    }

    const { data, error } = await query
    
    if (error) {
      throw new Error(error.message)
    }
  
    return data
  }),
});