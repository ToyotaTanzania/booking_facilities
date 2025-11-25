"use client";
import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const items = [
    { label: "Home", href: "/" },
    { label: "Users", href: "/users" },
    // { label: "Profiles", href: "/users/profiles" },
    // { label: "Staff", href: "/users/staff" },
    { label: "Facilities", href: "/facilities" },
    { label: "Facility Types", href: "/facility-types" },
    { label: "Buildings", href: "/buildings" },
    { label: "Locations", href: "/locations" },
    { label: "Schedules", href: "/schedules" },
  ];

  const { status } = useSession();

  return (
    <div className="space-y-4">
      <div className="w-full">
        <nav className="flex items-center justify-between rounded-lg border bg-background/80 p-2 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/" className="flex items-center gap-2 shrink-0" prefetch>
              <Image
                src="https://ik.imagekit.io/ttltz/brands/one/one-colored_H32SW3x_4.png?updatedAt=1757667292237"
                alt="Karimjee Logo"
                height={28}
                width={56}
                className="object-contain"
              />
              <span className="hidden sm:inline text-sm font-semibold text-muted-foreground">Admin</span>
            </Link>
            <div className="flex items-center gap-1 overflow-x-auto flex-wrap sm:flex-nowrap">
              {items.map((item) => (
                <Link key={item.href} href={item.href} prefetch>
                  <Button variant="ghost" size="sm" className="shrink-0 rounded-full">
                    {item.label}
                  </Button>
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {status === "authenticated" && (
              <Button variant="outline" size="sm" onClick={() => signOut()} className="shrink-0">
                Sign out
              </Button>
            )}
          </div>
        </nav>
      </div>

      <div>{children}</div>
    </div>
  );
}
