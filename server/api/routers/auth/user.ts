import { z } from "zod";
import { env } from "@/env";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server";

export const userRouter = createTRPCRouter({
  hello: protectedProcedure
    .query(async ({ input, ctx }) => {
       const { data } = await ctx.supabase.from('users').select('*');
       return { 
        data,
        user: ctx.session
      }
  }),

  signin: publicProcedure
    .input(z.object({
      email: z.string().email(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { data, error } = await ctx.supabase.auth.signInWithOtp({
        email: input.email,
        options: { 
          emailRedirectTo: `${env.NEXTAUTH_URL}/auth/callback`,
         //  emailRedirectTo: `${process.env.NEXTAUTH_URL}/auth/callback?pkce=true`,
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      return { 
        success: true,
        email: input.email,
       }
    }),

  verify: publicProcedure
    .input(z.object({
      email: z.string().email(),
      otp: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { data, error } = await ctx.supabase.auth.verifyOtp({
        email: input.email,
        token: input.otp,
        type: 'email'
      }); 

      if (error) {
        throw new Error(error.message);
      }

      return { 
        success: true,
        email: input.email,
        access_token: data?.session?.access_token,
        refresh_token: data?.session?.refresh_token,
       }
    }),


});
