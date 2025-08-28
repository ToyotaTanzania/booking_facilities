import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server";

export const facilityTypeRouter = createTRPCRouter({
  list: publicProcedure
    .query(async ({ ctx }) => {
      const { data, error } = await ctx.supabase
        .from("facility_type")
        .select("*")
        .order("name");

      if (error) throw error;
      return data;
    }),

  getByName: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from("facility_type")
        .select("*")
        .eq("name", input)
        .single();

      if (error) throw error;
      return data;
    }),

  create: publicProcedure
    .input(z.object({
      name: z.string().min(1),
      description: z.string().nullable(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from("facility_type")
        .insert(input)
        .select()
        .single();

      if (error) throw error;
      return data;
    }),

  update: publicProcedure
    .input(z.object({
      originalName: z.string(),
      data: z.object({
        name: z.string().min(1),
        description: z.string().nullable(),
      }),
    }))
    .mutation(async ({ ctx, input }) => {
      // Check if new name conflicts with existing types (excluding current)
      if (input.data.name !== input.originalName) {
        const { data: existing } = await ctx.supabase
          .from("facility_type")
          .select("name")
          .eq("name", input.data.name)
          .neq("name", input.originalName)
          .limit(1);

        if (existing && existing.length > 0) {
          throw new Error("Facility type with this name already exists");
        }
      }

      const { data, error } = await ctx.supabase
        .from("facility_type")
        .update(input.data)
        .eq("name", input.originalName)
        .select()
        .single();

      if (error) throw error;
      return data;
    }),

  delete: publicProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      // Check if type is being used by any facilities
      const { data: facilities } = await ctx.supabase
        .from("facilities")
        .select("id")
        .eq("type", input)
        .limit(1);

      if (facilities && facilities.length > 0) {
        throw new Error("Cannot delete facility type that is being used by facilities");
      }

      const { error } = await ctx.supabase
        .from("facility_type")
        .delete()
        .eq("name", input);

      if (error) throw error;
      return true;
    }),
});