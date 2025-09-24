
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import { createClient } from "@supabase/supabase-js";
import CredentialsProvider from "next-auth/providers/credentials";
import { SupabaseAdapter } from "@auth/supabase-adapter";

import { env } from "@/env";

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {

      id: string;
      role?: string;
      email?: string;
      name?: string;
      image?: any;
      unit?: string;
      division?: string;
      segment?: string;
      cluster?: string;
      legalEntity?: string;
      department?: string;

      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
    accessToken?: string;
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  providers: [
    CredentialsProvider({
      name: "OTP",
      id: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        otp: { label: "OTP", type: "text" },
        access_token: { label: "Access Token", type: "text" },
        refresh_token: { label: "Refresh Token", type: "text" },
      },
      async authorize(credentials, request) {

          return {
            id: "feisal",
            email: "feisal.ali@karimjee.com",
            name: "Feisal Ali",
            level: "administrator",
          };
        }
    }),
    {
      id: "supabase",
      name: "Supabase",
      type: "oauth",
      authorization: {
        url: `${env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/authorize`,
        params: {
          provider: "email",
          response_type: "code",
          access_type: "offline",
        },
      },
      token: {
        url: `${env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/token`,
        async request({ client, params, checks, provider }: { client: any, params: any, checks: any, provider: any }) {
          const { code, accessToken, refreshToken, expiresAt } = params;
          
          // If we have direct tokens from magic link, use them
          if (accessToken && refreshToken && expiresAt) {
            return {
              tokens: {
                access_token: accessToken,
                refresh_token: refreshToken,
                expires_at: expiresAt,
              },
            };
          }

          // Otherwise, exchange the code for tokens
          const tokenUrl = typeof provider.token === 'string' ? provider.token : provider.token?.url;
          
          if (!tokenUrl) {
            throw new Error('Token URL is not defined');
          }

          const response = await fetch(tokenUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              grant_type: "authorization_code",
              code: code as string,
              client_id: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
              redirect_uri: `${env.NEXT_PUBLIC_SUPABASE_URL}/auth/callback`,
            }),
          });

          const tokens = await response.json();
          return { tokens };
        },
      },
      userinfo: {
        url: `${env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/user`,
        async request({ tokens }: { tokens: { access_token : string}}) {
          const response = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/user`, {
            headers: {
              Authorization: `Bearer ${tokens.access_token}`,
            },
          });
          return response.json();
        },
      },
      profile(profile) {
        return {
          id: profile.id,
          name: profile.user_metadata?.name || profile.email,
          email: profile.email,
          level: profile.user_metadata?.level || 2,
        };
      },
    },
  ],
  secret: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  trustHost: true,
  adapter: SupabaseAdapter({
    url: env.NEXT_PUBLIC_SUPABASE_URL,
    secret: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  }),
  callbacks: {
    async jwt({ token, user, account }) {
 
      if (account && user) {
        return {
          ...token,
          accessToken: account.access_token,
          user,
        };
      }
      return token;
    },
    async session({ session, token }) {
  
      if (token) {
        session.user = token.user as any;
        session.accessToken = token.accessToken as string;
      }
      return session;
    },
  },
  pages: { 
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error"
  },
  session: {
    strategy: "jwt"
  }
} satisfies NextAuthConfig;
