// inside callbacks.jwt in src/server/auth.ts
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { jwtDecode } from "jwt-decode";

type JwtPayload = { exp?: number };

async function maybeRefresh(token: any) {
  const access = token.supabaseAccessToken as string | undefined;
  const refresh = token.supabaseRefreshToken as string | undefined;
  if (!access || !refresh) return token;

  // If exp < now + 60s, refresh
  const { exp } = (access ? jwtDecode<JwtPayload>(access) : {}) || {};
  const willExpireSoon = !exp || Date.now() / 1000 > exp - 60;

  if (willExpireSoon) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.refreshSession({ refresh_token: refresh });
    if (!error && data?.session) {
      token.supabaseAccessToken = data.session.access_token;
      token.supabaseRefreshToken = data.session.refresh_token;
    }
  }
  return token;
}