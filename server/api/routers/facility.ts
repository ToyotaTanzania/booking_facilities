import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server";

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
  list: publicProcedure
    .query(async ({ ctx }) => {
      const { data, error } = await ctx.supabase
        .from("facilities")
        .select(`
          *,
          building:buildings(*),
          type:facility_type(*)
        `)
        .order("name");

      if (error) throw error;
      return data;
    }),

  getById: publicProcedure
    .input(z.number())
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from("facilities")
        .select(`
          *,
          building:buildings(*),
          type:facility_type(*)
        `)
        .eq("id", input)
        .single();

      if (error) throw error;
      return data;
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
      return data;
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