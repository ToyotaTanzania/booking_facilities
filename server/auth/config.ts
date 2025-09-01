// src/server/auth.ts
import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * We accept Supabase access/refresh tokens as "credentials", validate on the server,
 * and then store/refresh them inside the NextAuth JWT.
 */
export const authConfig = {
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      id: "supabase",
      name: "Supabase",
      credentials: {
        access_token: { label: "access_token", type: "text" },
        refresh_token: { label: "refresh_token", type: "text" },
      },
      async authorize(creds) {
        const { access_token, refresh_token } = creds
        
        if (!access_token) return null;

        // Validate token against Supabase Auth (server-side)
        const supabase = await createSupabaseServerClient();

        const { data, error } = await supabase.auth.getUser(access_token as string);
 
        // getUser(jwt) verifies token with Supabase Auth.  [oai_citation:3‡Supabase](https://supabase.com/docs/reference/javascript/auth-getuser?utm_source=chatgpt.com)
        if (error || !data?.user) return null;
    

        const profile = await supabase.from('profiles')
        .select('*').eq('userid', data?.user?.id).maybeSingle();

        if (profile.error) return null;

        return {
          id: data.user.id,
          email: data.user.email,
          name: profile.data.name,
          unit: profile.data.unit,
          role: profile.data.role,
          user: data?.user,
          division: profile.data.division,
          segment: profile.data.segment,
          cluster: profile.data.cluster, 
          legal_entity: profile.data.legal_entity,
          isActive: profile.data.isActive,
          supabaseAccessToken: creds.access_token,
          supabaseRefreshToken: creds.refresh_token ?? null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Initial sign-in: persist Supabase tokens into the JWT
      if (user) {
        token.sub = user.id;
        token.id = user.id;
        token.user = user;
        token.supabaseAccessToken = (user as any).supabaseAccessToken;
        token.supabaseRefreshToken = (user as any).supabaseRefreshToken;
        // We don't know exact exp here; we'll rely on refresh on demand.
        token.exp = (user as any).exp;
        token.unit = (user as any).unit;
        token.role = (user as any).role;
        token.division = (user as any).division;
        token.segment = (user as any).segment;
        token.cluster = (user as any).cluster;
        token.legal_entity = (user as any).legal_entity;
        token.isActive = (user as any).isActive;
        token.name = (user as any).name;
        token.email = (user as any).email;
      }

      // Try proactive refresh if we can (optional safety net)
      // If you want to check expiry, you can decode and inspect "exp" in the access token.
      if (token.supabaseRefreshToken) {
        // Example: eager refresh when we fail to read claims (optional)
        // You can keep it simple and refresh only on 401s in your fetchers instead.
      }

      return token;
    },
    async session({ session, token, user }) {
      // Expose Supabase tokens in the NextAuth session (server & client)
      (session as any).supabase = {
        ...user,
        ...token,
        access_token: token.supabaseAccessToken,
        refresh_token: token.supabaseRefreshToken,
      };
      return session;
    },
  },
} satisfies NextAuthConfig;
