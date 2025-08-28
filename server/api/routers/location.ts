import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server";

export const locationRouter = createTRPCRouter({
  list: publicProcedure
    .query(async ({ ctx }) => {
      const { data, error } = await ctx.supabase
        .from("locations")
        .select("*")
        .order("name");

      if (error) throw error;
      return data;
    }),

  getById: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from("locations")
        .select("*")
        .eq("name", input)
        .single();

      if (error) throw error;
      return data;
    }),

  create: publicProcedure
    .input(z.object({
      name: z.string().min(1),
      address: z.string().nullable(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from("locations")
        .insert(input)
        .select()
        .single();

      if (error) throw error;
      return data;
    }),

  update: publicProcedure
    .input(z.object({
      name: z.string(),
      data: z.object({
        name: z.string().min(1),
        address: z.string().nullable(),
      }),
    }))
    .mutation(async ({ ctx, input }) => {
      // First check if the new name already exists (if name is being changed)
      if (input.name !== input.data.name) {
        const { data: existing } = await ctx.supabase
          .from("locations")
          .select("name")
          .eq("name", input.data.name)
          .single();

        if (existing) {
          throw new Error("A location with this name already exists");
        }
      }

      const { data, error } = await ctx.supabase
        .from("locations")
        .update(input.data)
        .eq("name", input.name)
        .select()
        .single();

      if (error) throw error;
      return data;
    }),

  delete: publicProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const { error } = await ctx.supabase
        .from("locations")
        .delete()
        .eq("name", input);

      if (error) throw error;
      return true;
    }),
});