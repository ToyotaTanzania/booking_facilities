import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/server'; 

export const responsiblePersonRouter = createTRPCRouter({
  list: protectedProcedure
    .input(z.object({
      facility: z.number().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      let query = ctx.db
        .from('responsible_person')
        .select('*, facility(*)');

      if (input?.facility) {
        query = query.eq('facility', input.facility);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    }),

  getById: protectedProcedure
    .input(z.number())
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.db
        .from('responsible_person')
        .select('*, facility(*)')
        .eq('id', input)
        .single();

      if (error) throw error;
      return data;
    }),

  create: protectedProcedure
    .input(z.object({
      user: z.string().uuid(),
      facility: z.number(),
      phone: z.string().nullable(),
      email: z.string().email().nullable(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.db
        .from('responsible_person')
        .insert(input)
        .select('*, facility(*)')
        .single();

      if (error) throw error;
      return data;
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      data: z.object({
        user: z.string().uuid().optional(),
        facility: z.number().optional(),
        phone: z.string().nullable().optional(),
        email: z.string().email().nullable().optional(),
      }),
    }))
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.db
        .from('responsible_person')
        .update(input.data)
        .eq('id', input.id)
        .select('*, facility(*)')
        .single();

      if (error) throw error;
      return data;
    }),

  delete: protectedProcedure
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      const { error } = await ctx.db
        .from('responsible_person')
        .delete()
        .eq('id', input);

      if (error) throw error;
      return true;
    }),
});
