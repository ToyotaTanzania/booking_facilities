"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  Home,
  MapPin,
  Settings,
  Users,
  Calendar,
  Clock,
  Factory,
  Layers,
  UserCircle,
  UserSquare,
  CalendarCheck,
  CalendarRange,
  CircleAlert,
  UserCog,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { SignOutButton } from "@/app/auth/signin/signout";
import Image from "next/image";

const routes = [
  {
    label: "Home",
    icon: Home,
    href: "/",
  },
  {
    label: "Manage",
    icon: Settings,
    children: [
      // {
      //   label: "Reports",
      //   icon: BarChart3,
      //   href: "/",
      // },
      {
        label: "Locations",
        icon: MapPin,
        href: "/locations",
      },
      {
        label: "Buildings",
        icon: Building2,
        href: "/buildings",
      },
      {
        label: "Facility Types",
        icon: Layers,
        href: "/facility-types",
      },
      {
        label: "Facilities",
        icon: Factory,
        href: "/facilities",
      },
      {
        label: "Schedules",
        icon: Clock,
        href: "/schedules",
      },
    ],
  },
  {
    label: "User Management",
    icon: UserCog,
    children: [
      {
        label: "All Users",
        icon: Users,
        href: "/users",
      },
      {
        label: "User Profiles",
        icon: UserCircle,
        href: "/users/profiles",
      },
      {
        label: "Staff Directory",
        icon: UserSquare,
        href: "/users/staff",
      },
    ],
  },
  {
    label: "Bookings",
    icon: Calendar,
    children: [
      {
        label: "All Bookings",
        icon: CalendarCheck,
        href: "/bookings",
      },
      {
        label: "My Bookings",
        icon: CalendarRange,
        href: "/bookings/my-bookings",
      },
      {
        label: "Pending Approvals",
        icon: CircleAlert,
        href: "/bookings/pending",
      },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>("Manage");

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
    if (!isCollapsed) {
      setOpenSection(null);
    }
  };

  const toggleSection = (label: string) => {
    setOpenSection(openSection === label ? null : label);
  };

  return (
    <div
      className={cn(
        "bg-card border-border relative flex flex-col border-r",
        isCollapsed ? "w-[80px]" : "w-[280px]",
      )}
    >
      <div className="flex items-center justify-between p-6">
        <div
          className={cn(
            "flex items-center gap-x-2",
            isCollapsed && "w-full justify-center",
          )}
        >
          {/* <div className="w-8 h-8 bg-primary rounded-full"> */}
          {isCollapsed ? (
            <div className="w-10 h-10 flex items-center justify-center rounded-full"> 
            <Image
              src="https://ik.imagekit.io/ttltz/brands/one/one-colored_H32SW3x_4.png?updatedAt=1757667292237"
              alt="Karimjee Logo"
              width={32}
              height={32}
              className="rounded-full"
            />
            </div>
          ) : (
            <Image
              src="https://ik.imagekit.io/ttltz/brands/one/one-colored_H32SW3x_4.png?updatedAt=1757667292237"
              alt="Karimjee Logo"
              height={40}
              width={400}
              className="object-contain"
            />
          )}
          {/* </div> */}
          {/* {!isCollapsed && <h1 className="font-bold">Facilities</h1>} */}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto"
          onClick={toggleCollapse}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>
      <div className="flex flex-col gap-y-2 p-3">
        {routes.map((route) => (
          <div key={route.label}>
            {route.children ? (
              <div className="flex flex-col">
                <Button
                  variant={openSection === route.label ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-x-2",
                    isCollapsed && "justify-center px-2",
                  )}
                  onClick={() => !isCollapsed && toggleSection(route.label)}
                >
                  <route.icon className="h-4 w-4" />
                  {!isCollapsed && <span>{route.label}</span>}
                </Button>
                {openSection === route.label && !isCollapsed && (
                  <div className="mt-2 ml-4 flex flex-col gap-y-2">
                    {route.children.map((child) => (
                      <Button
                        key={child.href}
                        variant={
                          pathname === child.href ? "secondary" : "ghost"
                        }
                        className="w-full justify-start gap-x-2"
                        asChild
                      >
                        <Link href={child.href}>
                          <child.icon className="h-4 w-4" />
                          <span>{child.label}</span>
                        </Link>
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Button
                variant={pathname === route.href ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-x-2",
                  isCollapsed && "justify-center px-2",
                )}
                asChild
              >
                <Link href={route.href}>
                  <route.icon className="h-4 w-4" />
                  {!isCollapsed && <span>{route.label}</span>}
                </Link>
              </Button>
            )}
          </div>
        ))}
      </div>
      <div className="border-border mt-auto border-t p-3">
        <SignOutButton />
      </div>
    </div>
  );
}
