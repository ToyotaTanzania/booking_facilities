'use client'

import { cva } from "class-variance-authority";
import { format, differenceInMinutes, parseISO } from "date-fns";

import { useCalendar } from "@/calendar/contexts/calendar-context";

// import { DraggableEvent } from "@/calendar/components/dnd/draggable-event";
import { EventDetailsDialog } from "@/calendar/components/dialogs/event-details-dialog";

import { cn } from "@/lib/utils";

import type { HTMLAttributes } from "react";
import type { IEvent } from "@/calendar/interfaces";
import type { VariantProps } from "class-variance-authority";
import { User, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { useSession } from "next-auth/react";

const calendarWeekEventCardVariants = cva(
  "flex select-none flex-col gap-0.5 truncate whitespace-nowrap rounded-md border px-2 py-1.5 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
  {
    variants: {
      color: {
        // Colored and mixed variants
        blue: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300 [&_.event-dot]:fill-blue-600",
        green:
          "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300 [&_.event-dot]:fill-green-600",
        red: "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300 [&_.event-dot]:fill-red-600",
        yellow:
          "border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-300 [&_.event-dot]:fill-yellow-600",
        purple:
          "border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-800 dark:bg-purple-950 dark:text-purple-300 [&_.event-dot]:fill-purple-600",
        orange:
          "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-300 [&_.event-dot]:fill-orange-600",
        gray: "border-neutral-200 bg-neutral-50 text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 [&_.event-dot]:fill-neutral-600",

        // Dot variants
        "blue-dot":
          "bg-neutral-50 dark:bg-neutral-900 [&_.event-dot]:fill-blue-600",
        "green-dot":
          "bg-neutral-50 dark:bg-neutral-900 [&_.event-dot]:fill-green-600",
        "red-dot":
          "bg-neutral-50 dark:bg-neutral-900 [&_.event-dot]:fill-red-600",
        "orange-dot":
          "bg-neutral-50 dark:bg-neutral-900 [&_.event-dot]:fill-orange-600",
        "purple-dot":
          "bg-neutral-50 dark:bg-neutral-900 [&_.event-dot]:fill-purple-600",
        "yellow-dot":
          "bg-neutral-50 dark:bg-neutral-900 [&_.event-dot]:fill-yellow-600",
        "gray-dot":
          "bg-neutral-50 dark:bg-neutral-900 [&_.event-dot]:fill-neutral-600",
      },
    },
    defaultVariants: {
      color: "blue-dot",
    },
  },
);

interface IProps
  extends HTMLAttributes<HTMLDivElement>,
    Omit<VariantProps<typeof calendarWeekEventCardVariants>, "color"> {
  event: IEvent;
}

export function EventBlock({ event, className }: IProps) {
  const { badgeVariant, responsibles, setLocalEvents } = useCalendar();
  const { data: session } = useSession();


  const startStr = String(event.startDate ?? event.start);
  const endStr = String(event.endDate ?? event.end);
  const start = parseISO(startStr);
  const end = parseISO(endStr);
  const durationInMinutes = differenceInMinutes(end, start);
  const heightInPixels = (durationInMinutes / 60) * 160 - 8;

  const baseColor: string = event.color
    ? String(event.color)
    : ["approved", "confirmed"].includes(event.status)
      ? "green"
      : ["rejected", "cancelled"].includes(event.status)
        ? "red"
        : "yellow";
  const color = (
    badgeVariant === "dot" ? `${baseColor}-dot` : baseColor
  ) as VariantProps<typeof calendarWeekEventCardVariants>["color"];

  const calendarWeekEventCardClasses = cn(
    calendarWeekEventCardVariants({ color, className }),
    durationInMinutes < 35 && "py-0 justify-center",
    'rounded-xs', 
    "cursor-pointer",
    "relative",
    "min-h-[120px]"
  );

  // Helpers
  const getId = (value: number | { id: number } | undefined): number | undefined => {
    if (typeof value === "number") return value;
    if (value && typeof value === "object" && "id" in value) return value.id;
    return undefined;
  };

  const facilityId = getId(event.facility);
  const slotId = getId(event.slot as unknown as { id: number } | number | undefined) ?? (typeof event.slot === "number" ? event.slot : undefined);
  const scheduleId = getId(event.schedule as unknown as { id: number } | number | undefined) ?? (typeof event.schedule === "number" ? event.schedule : undefined);
  const dateStr = typeof event.date === "string" ? event.date : new Date(event.date).toISOString();

  // Mutations
  const { mutate: acceptBooking, isPending: isAccepting } = api.booking.accept.useMutation({
    onSuccess: () => {
      setLocalEvents(prev => prev.map(e => e.id === event.id ? { ...e, status: "approved" } : e));
    },
  });
  const { mutate: rejectBooking, isPending: isRejecting } = api.booking.reject.useMutation({
    onSuccess: () => {
      setLocalEvents(prev => prev.map(e => e.id === event.id ? { ...e, status: "rejected" } : e));
    },
  });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (e.currentTarget instanceof HTMLElement) e.currentTarget.click();
    }
  };

  return (
    // <DraggableEvent event={event}>
      <EventDetailsDialog event={event}>
        <div
          role="button"
          tabIndex={0}
          className={calendarWeekEventCardClasses}
          style={{ height: `${heightInPixels}px` }}
          onKeyDown={handleKeyDown}
        >
          {/* <Badge
            variant={
              ["rejected", "cancelled"].includes(event.status) ? "destructive" :
              ["approved", "confirmed"].includes(event.status) ? "default" :
              "secondary"
            }
            className="absolute right-1 top-1 z-10 px-1.5 py-0.5 text-[10px] capitalize"
          >
            {event.status}
          </Badge> */}
          {/* <div className="flex items-center gap-1.5 truncate">
            {["mixed", "dot"].includes(badgeVariant) && (
              <svg width="8" height="8" viewBox="0 0 8 8" className="event-dot shrink-0">
                <circle cx="4" cy="4" r="4" />
              </svg>
            )}

            <p className="truncate font-semibold">{event.title}</p>

          </div>

          {durationInMinutes > 25 && (
            <p>
              {format(start, "h:mm a")} - {format(end, "h:mm a")}
            </p>
          )} */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1.5">
              {["mixed", "dot"].includes(badgeVariant) && (
                <svg
                  width="8"
                  height="8"
                  viewBox="0 0 8 8"
                  className="event-dot shrink-0"
                >
                  <circle cx="4" cy="4" r="4" />
                </svg>
              )}

              <div className="flex justify-between">
                <span className="font-medium">{event.title ?? "Booking"}</span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Clock className="size-3 shrink-0" />
              <p className="text-foreground text-xs">
                {format(start, "h:mm a")} - {format(end, "h:mm a")}
              </p>
            </div>

            {/* Facility / Building / Location */}
            <div className="flex flex-col gap-0.5">
              {typeof event.facility === "object" && (
                <p className="text-foreground text-xs">Facility: {event.facility.name}</p>
              )}
              {typeof event.facility === "object" && typeof event.facility.building !== "undefined" && (
                <>
                  {typeof event.facility.building === "object" && (
                    <>
                      {typeof event.facility.building.location === "object" && (
                        <p className="text-foreground text-xs">Location: {event.facility.building.location.name}</p>
                      )}
                      {typeof event.facility.building.location === "string" && (
                        <p className="text-foreground text-xs">Location: {event.facility.building.location}</p>
                      )}
                    </>
                  )}
                </>
              )}
            </div>

            <div className="flex items-center gap-1">
              {/* <Text className="size-3 shrink-0" /> */}
              <p className="text-foreground text-xs">{event.description}</p>
            </div>

            {/* Actions for responsible user when pending */}
            {(() => {
              type Responsible = { user: string; facility: number | { id: number } };
              const responsiblesList = (responsibles ?? []) as Responsible[];
              const responsible = responsiblesList.find(r => getId(r.facility) === facilityId);
              const currentUserId: string | undefined = (session as unknown as { supabase?: { sub?: string } } | null)?.supabase?.sub;
              const canModerate = event.status === "pending" && Boolean(currentUserId) && responsible?.user === currentUserId;

              if (!canModerate || !facilityId || !slotId) return null;
              return (
                <div className="mt-1 flex items-center justify-end gap-2">
                  <Button size="sm" variant="secondary" disabled={isRejecting} onClick={() => rejectBooking({ facility: facilityId, date: dateStr, slot: slotId, comment: "" })}>
                    Reject
                  </Button>
                  <Button size="sm" disabled={isAccepting} onClick={() => acceptBooking({ facility: facilityId, date: dateStr, slot: slotId, schedule: scheduleId ?? 0, comment: event.description ?? "" })}>
                    Approve
                  </Button>
                </div>
              );
            })()}
          </div>
        </div>
      </EventDetailsDialog>
    // </DraggableEvent>
  );
}
