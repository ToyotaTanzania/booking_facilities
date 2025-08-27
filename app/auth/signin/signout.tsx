"use client";
import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <Button
      variant="destructive"
      className="cursor-pointer"
      onClick={async () => {
        const supabase = createSupabaseBrowserClient();
        await supabase.auth.signOut(); // clears browser session
        await signOut({ callbackUrl: "/auth/signin" });
      }}
    >
      Sign out
    </Button>
  );
}