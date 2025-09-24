import { SignOutButton } from "../auth/signin/signout";
import { Sidebar } from "./_components/sidebar";
import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import type { Session } from "next-auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) {
    redirect("/auth/signin");
  }

  type SupabaseSession = Session & { supabase?: { role?: string } };
  const supaSession = session as SupabaseSession;
  const role = supaSession.supabase?.role;

  return (
    <div className="relative flex min-h-screen">
      {role === "admin" && <Sidebar />}
      
      <main className="flex-1 overflow-y-auto bg-muted/10 pb-16">
        <div className="flex-1 space-y-4 p-2">
          {/* <CheckAuth />  */}
          {children}
        </div>
      </main>
    </div>
  );
}
