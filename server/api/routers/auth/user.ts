import { z } from "zod";
import { env } from "@/env";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server";

export const userRouter = createTRPCRouter({
  hello: protectedProcedure.query(async ({ input, ctx }) => {
    const { data } = await ctx.supabase.from("users").select("*");
    return {
      data,
      user: ctx.session,
    };
  }),

  list: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        role: z.string().optional(),
        status: z.string().optional(),
      }),
    )
    .query(async ({ ctx }) => {
      const { data, error } = await ctx.supabase.from("profiles").select("*");
      if (error) {
        throw new Error(error.message);
      }
      return data;
    }),

    getAll: protectedProcedure
    .query(async ({ ctx }) => {
      const { data, error } = await ctx.supabase.from("profiles").select("*");
      if (error) {
        throw new Error(error.message);
      }
      return data;
    }),

  signin: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { data, error } = await ctx.supabase.auth.signInWithOtp({
        email: input.email,
        options: {
          emailRedirectTo: `${env.NEXTAUTH_URL}/auth/callback`,
          //  emailRedirectTo: `${process.env.NEXTAUTH_URL}/auth/callback?pkce=true`,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        email: input.email,
      };
    }),

  verify: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        otp: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { data, error } = await ctx.supabase.auth.verifyOtp({
        email: input.email,
        token: input.otp,
        type: "email",
      });

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        email: input.email,
        access_token: data?.session?.access_token,
        refresh_token: data?.session?.refresh_token,
      };
    }),


  // Update user
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        email: z.string().email().optional(),
        name: z.string().min(1, "Name is required").optional(),
        role: z.string().optional(),
        status: z.string().optional(),
        phone: z.string().nullable().optional(),
        department: z.string().nullable().optional(),
        profile: z.object({
          name: z.string().min(1, "Name is required").optional(),
          phone: z.string().nullable().optional(),
          unit: z.string().nullable().optional(),
          segment: z.string().nullable().optional(),
          division: z.string().nullable().optional(),
          legal_entity: z.string().nullable().optional(),
          isActive: z.boolean().optional(),
          role: z.string().nullable().optional(),
        }).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => { 
      
      const { data, error } = await ctx.supabase.from('profile').update({
        name: input.profile?.name,
        phone: input.profile?.phone,
        unit: input.profile?.unit,
        segment: input.profile?.segment,
        division: input.profile?.division,
        legal_entity: input.profile?.legal_entity,
        isActive: input.profile?.isActive,
        role: input.profile?.role,
        email: input.email,
        updated_at: new Date().toISOString(),
      }).eq('id', input.id).select().maybeSingle()

      if(error){ 
        throw new Error(error.message);
      }

      return data;

    })
  
});
