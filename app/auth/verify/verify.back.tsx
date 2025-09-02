// src/app/(auth)/verify-otp/actions.ts
// "use server";
// import { createSupabaseServerClient } from "@/lib/supabase/server";

// import { signIn } from "@/server/auth"; // NextAuth server helper

// export async function verifyOtpAction(_: unknown, formData: FormData) {
//   const email = String(formData.get("email") || "");
//   const token = String(formData.get("token") || "");

//   const supabase = createSupabaseServerClient();
//   const { data, error } = await supabase.auth.verifyOtp({
//     email,
//     token,
//     type: "email", // or 'magiclink' or 'sms' depending on your flow
//   });
//   if (error || !data?.session) throw error ?? new Error("No session");

//   await signIn("supabase", {
//     access_token: data.session.access_token,
//     refresh_token: data.session.refresh_token,
//     redirect: false,
//   });

//   return { ok: true };
}