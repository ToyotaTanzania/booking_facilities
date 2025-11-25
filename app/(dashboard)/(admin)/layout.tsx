import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

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

  return (
    <div className="space-y-4">
      <div className="w-full overflow-x-auto">
        <nav className="flex items-center gap-2 rounded-md border bg-background p-2">
          {items.map((item) => (
            <Link key={item.href} href={item.href} prefetch>
              <Button variant="outline" size="sm" className="shrink-0">
                {item.label}
              </Button>
            </Link>
          ))}
        </nav>
      </div>

      <div>{children}</div>
    </div>
  );
}
