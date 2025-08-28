"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  Home,
  LayoutDashboard,
  ListTodo,
  MapPin,
  Settings,
  Users,
  Calendar,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "",
  },
  {
    label: "Manage",
    icon: Home,
    children: [
      {
        label: "Dashboard",
        icon: Home,
        href: "/",
      },
      {
        label: "Locations",
        icon: ListTodo,
        href: "/locations",
      },
      {
        label: "Buildings",
        icon: ListTodo,
        href: "/buildings",
      },
      {
        label: "Facility Types",
        icon: ListTodo,
        href: "/facility-types",
      },
      {
        label: "Facilities",
        icon: Home,
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
    icon: Users,
    children: [
      {
        label: "All Users",
        icon: Users,
        href: "/users",
      },
      {
        label: "User Profiles",
        icon: Users,
        href: "/users/profiles",
      },
      {
        label: "Staff Directory",
        icon: Users,
        href: "/users/staff",
      },
    ],
  },
  {
    label: "Bookings",
    icon: Home,
    children: [
      {
        label: "All Bookings",
        icon: ListTodo,
        href: "/bookings",
      },
      {
        label: "My Bookings",
        icon: ListTodo,
        href: "/bookings/my-bookings",
      },
      {
        label: "Pending Approvals",
        icon: ListTodo,
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
        "relative flex flex-col bg-card border-r border-border",
        isCollapsed ? "w-[80px]" : "w-[280px]"
      )}
    >
      <div className="p-6 flex items-center justify-between">
        <div
          className={cn(
            "flex items-center gap-x-2",
            isCollapsed && "justify-center w-full"
          )}
        >
          <div className="w-8 h-8 bg-primary rounded-full" />
          {!isCollapsed && <h1 className="font-bold">Facilities</h1>}
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
                    isCollapsed && "justify-center px-2"
                  )}
                  onClick={() => !isCollapsed && toggleSection(route.label)}
                >
                  <route.icon className="h-4 w-4" />
                  {!isCollapsed && <span>{route.label}</span>}
                </Button>
                {openSection === route.label && !isCollapsed && (
                  <div className="ml-4 flex flex-col gap-y-2 mt-2">
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
                  isCollapsed && "justify-center px-2"
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
    </div>
  );
}