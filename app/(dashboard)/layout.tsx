import { SignOutButton } from "../auth/signin/signout";
import { Sidebar } from "./_components/sidebar";
import CheckAuth from "./check-auth";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen">
      {/* <Sidebar /> */}
      <div className="absolute top-4 right-4 z-50"> 
        <SignOutButton />
      </div>
      <main className="flex-1 overflow-y-auto bg-muted/10 pb-16">
        <div className="flex-1 space-y-4 p-2">
          <CheckAuth /> 
          {children}
        </div>
      </main>
    </div>
  );
}
