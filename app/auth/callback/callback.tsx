// src/app/auth/callback/page.tsx
"use client";

import { useEffect } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import {  useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

const  SupabaseCallback = () => {
  const router = useRouter();

    useEffect(() => {
    const complete = async () => {
      const supabase = createSupabaseBrowserClient();
      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        return router.replace("/auth/signin?error=no_session");
      }
      const { access_token, refresh_token } = data.session;
      await signIn("supabase", {
        access_token,
        refresh_token,
        redirect: false,
        callbackUrl: "/",
      });
    };

    complete();
  }, [router]);

  return <p>Signing you in…</p>;
}

export default SupabaseCallback