import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "@/server";

const facilitySchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.string().min(1, "Type is required"),
  building: z.number().min(1, "Building is required"),
  description: z.string().nullable(),
  amenities: z.array(z.string()).nullable(),
  capacity: z.coerce.number().min(1, "Capacity is required"),
  images: z.any().nullable(),
});

export const facilityRouter = createTRPCRouter({
  getAssignedToMe: protectedProcedure
    .query(async ({ ctx }) => {
      // Get responsible assignments for current user
      const { data: responsibles, error } = await ctx.supabase
        .from('responsible_person')
        .select('*, facility:facility(*, building:buildings(*), type:facility_type(*))')
        .eq('user', ctx.session?.supabase?.id);

      if (error) throw error;

      const facilities = (responsibles || [])
        .map((r) => r.facility)
        .filter((f) => !!f);

      const facilityIds = facilities.map((f: any) => f.id as number);
      if (facilityIds.length === 0) return [] as any[];

      // Pending bookings per facility
      const { data: pendingBookings, error: pendingError } = await ctx.supabase
        .from('bookings')
        .select('id, facility')
        .in('facility', facilityIds)
        .eq('status', 'pending');

      if (pendingError) throw pendingError;

      const pendingCountByFacility: Record<number, number> = {};
      (pendingBookings || []).forEach((b: any) => {
        const fid = b.facility as number;
        pendingCountByFacility[fid] = (pendingCountByFacility[fid] || 0) + 1;
      });

      return facilities.map((f: any) => ({
        ...f,
        pendingCount: pendingCountByFacility[f.id] || 0,
      }));
    }),
  list: publicProcedure
    .query(async ({ ctx }) => {
      const { data, error } = await ctx.supabase
        .from("facilities")
        .select(`
          *,
          building:buildings(*)
        `)
        .order("name");

      const { data: responsiblePerson } = await ctx.supabase
        .from("responsible_person")
        .select(`*`);

      const { data: schedules } = await ctx.supabase
        .from("schedule")
        .select(`*`);
      
      const { data: slots } = await ctx.supabase
        .from("slots")
        .select(`*`);

      if (error) throw error;
      
      const results =  data.map((facility) => ({
        ...facility,
        responsible_person: responsiblePerson?.find((person) => person.facility === facility.id) || null,
        schedules: schedules?.find((schedule) => schedule.id === facility.schedule) || null,
        slots: slots?.filter((slot) => slot.schedule === facility.schedule) || null,
      }));
      
      return results
    }),

  filtered: publicProcedure
    .input(z.object({
      location: z.string().nullable().optional(),
      building: z.number().nullable().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { location, building } = input;

      const query = ctx.supabase
        .from("facilities")
        .select(`*,building:buildings(*)`);

      if (location) {
        query.eq("building.location", location);
      }

      if (building && building !== 0) {
        query.eq("building", building);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data.map((facility) => ({
        ...facility,
        building: facility.building,
      }));

    }),



  getAll: publicProcedure
    .query(async ({ ctx }) => {
      const { data, error } = await ctx.supabase
        .from("facilities")
        .select(`*,building:buildings(*)`);

      const { data: responsiblePerson } = await ctx.supabase
        .from("responsible_person")
        .select(`*`);
      
      const { data: slots } = await ctx.supabase
        .from("slots")
        .select(`*`); 

      if (error) throw error;
      return data.map((facility) => ({
        ...facility,
        responsible_person: responsiblePerson?.find((person) => person.facility === facility.id) || null,
        slots: slots?.filter((slot) => slot.schedule === facility.schedule) || null,
      }));
    }),

  getAllByDate: publicProcedure
    .input(z.object({
      date: z.date(),
      facility: z.number().nullable(),
      building: z.number().nullable(),
      location: z.number().nullable(),
    }))
    .query(async ({ ctx, input }) => {
      const { date, facility, building, location } = input;

   
      // const query = await ctx.supabase
      //   .from("facilities")
      //   .select(`
      //     *,
      //     building:buildings(*, location:locations(*)),
      //     type:facility_type(*)
      //   `)
      //   .order("name");

      // if (facility) {
      //   query.eq("facility", facility);
      // }

      // if (building) {
      //   query.eq("building", building);
      // }

      // if (location) {
        //   query.eq("location", location);
      // }

      const { data, error } = await ctx.supabase
        .from("facilities")
        .select(`
          *,
          building:buildings(*, location:locations(*)),
          type:facility_type(*)
        `)
        .order("name")

      if (error) throw error;

      const { data: responsiblePerson } = await ctx.supabase
        .from("responsible_person")
        .select(`*`);

      const { data: schedules } = await ctx.supabase
        .from("schedule")
        .select(`*`);
      
      const { data: slots } = await ctx.supabase
        .from("slots")
        .select(`*`);

      const { data: bookings } = await ctx.supabase
        .from("bookings")
        .select(`*`)
        .eq("date", input.date.toISOString());
      // Get responsible person and schedules for this facility
      return data.map((facility) => ({
        ...facility,
        responsible_person: responsiblePerson?.find((person) => person.facility === facility.id),
        schedules: schedules?.find((schedule) => schedule.id === facility.schedule),
        slots: slots?.filter((slot) => slot.schedule === facility.schedule),
        bookings: bookings?.filter((booking) => booking.facility === facility.id),
      }));

      
    }),

  getById: publicProcedure
    .input(z.number())
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from("facilities")
        .select(`
          *,
          building:buildings(*, location:locations(*)),
          type:facility_type(*)
        `)
        .eq("id", input)
        .single();

      if (error) throw error;

      // Get responsible person and schedules for this facility
      const { data: responsiblePerson } = await ctx.supabase
        .from("responsible_person")
        .select(`*`)
        .eq("facility", input)
        .maybeSingle();

      const { data: schedules } = await ctx.supabase
        .from("schedules")
        .select(`id, name, start_time, end_time, facility`)
        .eq("facility", input);

      return {
        ...data,
        responsible_person: responsiblePerson || null,
        schedules: schedules || null,
      };
    }),

  create: publicProcedure
    .input(facilitySchema)
    .mutation(async ({ ctx, input }) => {
      // Check if building exists
      const { data: buildingExists } = await ctx.supabase
        .from("buildings")
        .select("id")
        .eq("id", input.building)
        .single();

      if (!buildingExists) {
        throw new Error("Selected building does not exist");
      }

      // Check if facility type exists
      const { data: typeExists } = await ctx.supabase
        .from("facility_type")
        .select("name")
        .eq("name", input.type)
        .single();

      if (!typeExists) {
        throw new Error("Selected facility type does not exist");
      }

      const { data, error } = await ctx.supabase
        .from("facilities")
        .insert(input)
        .select(`
          *,
          building:buildings(*),
          type:facility_type(*)
        `)
        .single();

      if (error) throw error;

      // Return facility with empty responsible person and schedules
      return {
        ...data,
        responsible_person: null,
        schedules: null,
      };
    }),

  update: publicProcedure
    .input(z.object({
      id: z.number(),
      data: facilitySchema,
    }))
    .mutation(async ({ ctx, input }) => {
      // Check if building exists
      const { data: buildingExists } = await ctx.supabase
        .from("buildings")
        .select("id")
        .eq("id", input.data.building)
        .single();

      if (!buildingExists) {
        throw new Error("Selected building does not exist");
      }

      // Check if facility type exists
      const { data: typeExists } = await ctx.supabase
        .from("facility_type")
        .select("name")
        .eq("name", input.data.type)
        .single();

      if (!typeExists) {
        throw new Error("Selected facility type does not exist");
      }

      const { data, error } = await ctx.supabase
        .from("facilities")
        .update(input.data)
        .eq("id", input.id)
        .select(`
          *,
          building:buildings(*),
          type:facility_type(*)
        `)
        .single();

      if (error) throw error;

      // Get responsible person and schedules for this facility
      const { data: responsiblePerson } = await ctx.supabase
        .from("responsible_person")
        .select(`*`)
        .eq("facility", input.id)
        .maybeSingle();

      const { data: schedules } = await ctx.supabase
        .from("schedules")
        .select(`id, name, start_time, end_time, facility`)
        .eq("facility", input.id);

      return {
        ...data,
        responsible_person: responsiblePerson || null,
        schedules: schedules || null,
      };
    }),

    updateSchedule: publicProcedure
    .input(z.object({
      id: z.number(),
      schedule: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { data: scheduleExists } = await ctx.supabase
        .from("schedule")
        .select("id")
        .eq("id", input.schedule)
        .single();

      if (!scheduleExists) {
        throw new Error("Selected schedule does not exist");
      }

      const { data: facilityExists } = await ctx.supabase
        .from("facilities")
        .select("id")
        .eq("id", input.id)
        .single();

      if (!facilityExists) {
        throw new Error("Selected facility does not exist");
      }

      const { data, error } = await ctx.supabase
        .from("facilities")
        .update({ schedule: input.schedule })
        .eq("id", input.id)
        .select(`
          *,
          building:buildings(*),
          type:facility_type(*)
        `)
        .single();

      if (error) throw error;

      return { success: true }
    }),

    getResponsibles: publicProcedure
    .query(async ({ ctx, input }) => {
      // Check if facility has any bookings
      const { data, error  } = await ctx.supabase
        .from("responsible_person")
        .select(`*, facility(*, building(*))`);

      if (error) throw error;

      return data;
    }),

  delete: publicProcedure
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      // Check if facility has any bookings
      const { data: bookings } = await ctx.supabase
        .from("bookings")
        .select("id")
        .eq("facility", input)
        .limit(1);

      if (bookings && bookings.length > 0) {
        throw new Error("Cannot delete facility with existing bookings");
      }

      const { error } = await ctx.supabase
        .from("facilities")
        .delete()
        .eq("id", input);

      if (error) throw error;
      return true;
    }),


 
});