// Server: get Supabase tokens from NextAuth session
import { auth } from "@/server/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { api } from "@/trpc/server";
import { SignOutButton } from "../auth/signin/signout";

export default async function Page() {
  const session = await auth();
  const tokens = (session as any)?.supabase;

  const data = await api.auth.users.hello()

  return (
    <div>
        {
          JSON.stringify( data )
        }
        
        <div>
          <SignOutButton />
        </div>

    </div>
  )
}