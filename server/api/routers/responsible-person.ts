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
