// src/app/(auth)/sign-in/actions.ts
"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function sendMagicLink(formData: FormData) {
  const email = formData.get("email") as string;
  const supabase = createSupabaseServerClient();

  const result = await supabase.auth.signInWithOtp({
    email,
    options: {
      // Where the user lands after clicking the email link
      emailRedirectTo: `${process.env.NEXTAUTH_URL}/auth/callback`,
      //  emailRedirectTo: `${process.env.NEXTAUTH_URL}/auth/callback?pkce=true`,
    },
  });

  if (result.error) throw result.error;
}