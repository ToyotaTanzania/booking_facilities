import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server";

export const buildingRouter = createTRPCRouter({
  list: publicProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from("buildings")
      .select("*")
      .order("name");

    if (error) throw error;
    return data;
  }),

  filtered: publicProcedure
    .input(
      z.object({
        location: z.string().nullable().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {

      const { location } = input;

      const query = ctx.supabase
        .from("buildings")
        .select("*")
        .order("name");

      if (location) {
        query.eq("location", location);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    }),

  getById: publicProcedure.input(z.number()).query(async ({ ctx, input }) => {
    const { data, error } = await ctx.supabase
      .from("buildings")
      .select("*")
      .eq("id", input)
      .single();

    if (error) throw error;
    return data;
  }),

  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(1),
        location: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // First check if the location exists
      const { data: locationExists, error: locationError } = await ctx.supabase
        .from("locations")
        .select("name")
        .eq("name", input.location)
        .single();

      if (locationError || !locationExists) {
        throw new Error("Selected location does not exist");
      }

      const { data, error } = await ctx.supabase
        .from("buildings")
        .insert({
          name: input.name,
          location: input.location,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        data: z.object({
          name: z.string().min(1),
          location: z.string().min(1),
        }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // First check if the location exists
      const { data: locationExists, error: locationError } = await ctx.supabase
        .from("locations")
        .select("name")
        .eq("name", input.data.location)
        .single();

      if (locationError || !locationExists) {
        throw new Error("Selected location does not exist");
      }

      const { data, error } = await ctx.supabase
        .from("buildings")
        .update({
          name: input.data.name,
          location: input.data.location,
        })
        .eq("id", input.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    }),

  delete: publicProcedure.input(z.number()).mutation(async ({ ctx, input }) => {
    // Check if building has any facilities
    const { data: facilities } = await ctx.supabase
      .from("facilities")
      .select("id")
      .eq("building", input)
      .limit(1);

    if (facilities && facilities.length > 0) {
      throw new Error("Cannot delete building with existing facilities");
    }

    const { error } = await ctx.supabase
      .from("buildings")
      .delete()
      .eq("id", input);

    if (error) throw error;
    return true;
  }),
});
