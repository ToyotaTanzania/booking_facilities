import { z } from 'zod';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '@/server'; 

export const responsiblePersonRouter = createTRPCRouter({

  getMyRooms: protectedProcedure
  .query(async ({ ctx }) => { 
      const { data, error } = await ctx.supabase.from("responsible_person")
      .select(`*`)
      .eq("user", ctx.session?.supabase?.id)

      if (error) throw error;

      return data || [];

  }),

  getMyFacilitiesWithPending: protectedProcedure
  .query(async ({ ctx }) => {
    // Fetch responsible facilities for the current user with facility/building details
    const { data: responsibles, error } = await ctx.supabase
      .from('responsible_person')
      .select('*, facility:facility(*, building:buildings(*))')
      .eq('user', ctx.session?.supabase?.id);

    if (error) throw error;

    const facilities = responsibles || [];
    const facilityIds = facilities.map(r => r.facility?.id).filter(Boolean);

    if (facilityIds.length === 0) return [] as any[];

    // Fetch pending bookings for these facilities and count per facility on the server
    const { data: pendingBookings, error: bookingsError } = await ctx.supabase
      .from('bookings')
      .select('*, facility(*)')
      .in('facility', facilityIds as number[])
      .eq('status', 'pending');

    if (bookingsError) throw bookingsError;

    const pendingCountByFacility: Record<number, number> = {};
    (pendingBookings || []).forEach(b => {
      const fid = (b as any).facility as number;
      pendingCountByFacility[fid] = (pendingCountByFacility[fid] || 0) + 1;
    });

    const facilityWithBookings =  facilities.map(r => ({
      ...r,
      bookings: pendingBookings?.filter(b => (b as any).facility.id === r.facility?.id) || [],
    }));

    return facilityWithBookings;
  }),

  getById: protectedProcedure
    .input(z.number())
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('responsible_person')
        .select('*, facility(*)')
        .eq('facility', input)
        .single();

      if (error) throw error;
      return data;
    }),

  create: protectedProcedure
    .input(z.object({
      user: z.string().uuid(),
      facility: z.number(),
      name: z.string().nullable(),
      phone: z.string().nullable(),
      email: z.string().email().nullable(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Check if facility already has a responsible person
      const { data: existing } = await ctx.supabase
        .from('responsible_person')
        .select('*')
        .eq('facility', input.facility)
        .maybeSingle();

      let result;
      if (existing) {
        // Update existing record
        const { data, error } = await ctx.supabase
          .from('responsible_person')
          .update(input)
          .eq('facility', input.facility)
          .select('*, facility(*)')
          .single();
        
        if (error) throw error;
        result = data;
      } else {
        // Create new record
        const { data, error } = await ctx.supabase
          .from('responsible_person')
          .insert(input)
          .select('*, facility(*)')
          .single();
        
        if (error) throw error;
        result = data;
      }

      return result;
    }),

  update: protectedProcedure
    .input(z.object({
      facility: z.number(),
      data: z.object({
        user: z.string().uuid().optional(),
        name: z.string().nullable().optional(),
        phone: z.string().nullable().optional(),
        email: z.string().email().nullable().optional(),
      }),
    }))
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('responsible_person')
        .update(input.data)
        .eq('facility', input.facility)
        .select('*, facility(*)')
        .single();

      if (error) throw error;
      return data;
    }),

  delete: protectedProcedure
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      const { error } = await ctx.supabase
        .from('responsible_person')
        .delete()
        .eq('facility', input);

      if (error) throw error;
      return true;
    }),
});
