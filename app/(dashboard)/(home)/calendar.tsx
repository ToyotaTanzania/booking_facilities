"use client";

import Image from "next/image";
import { api } from "@/trpc/react";
import { Loader2, Plus } from "lucide-react";
import { SignOutButton } from "@/app/auth/signin/signout";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import TimeGridPlugin from "@fullcalendar/timegrid";
import InteractionPlugin from "@fullcalendar/interaction";
import { AddEventDialog } from "@/calendar/components/dialogs/add-event-dialog";
import CreateBookingDialog from "./components/create";
import { Button } from "@/components/ui/button";

interface BookingData {
  id: number;
  date: string;
  description: string;
  schedule: number;
  status: string;
  slot: {
    id: number;
    start: string;
    end: string;
  };
  facility: {
    id: number;
    name: string;
  };
  user: {
    userid: string;
    name: string;
    email: string;
    phone: string | null;
  };
}

export function BookingsCalendar() {
  const { data: bookings, isLoading: bookingsLoading } =
    api.booking.getCalendarBookings.useQuery();

  if (bookingsLoading) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <div className="text-muted-foreground flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p className="text-sm">Loading bookings</p>
        </div>
      </div>
    );
  }

  // Map API bookings to FullCalendar event objects
  function toLocalIsoNoZ(date: Date) {
    const pad = (n: number) => String(n).padStart(2, "0");
    const yyyy = date.getFullYear();
    const mm = pad(date.getMonth() + 1);
    const dd = pad(date.getDate());
    const hh = pad(date.getHours());
    const mi = pad(date.getMinutes());
    const ss = pad(date.getSeconds());
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}:${ss}`;
  }

  function parseHoursMinutes(
    value: string,
  ): { hour: number; minute: number } | null {
    const v = value.trim();
    // Formats: HH:mm, HH:mm:ss
    let m = /^([0-9]{1,2}):([0-9]{2})(?::([0-9]{2}))?$/.exec(v);
    if (m) {
      return { hour: parseInt(m[1]!), minute: parseInt(m[2]!) };
    }
    // Formats: h:mm AM/PM
    m = /^([0-9]{1,2}):([0-9]{2})\s*([AP]M)$/i.exec(v);
    if (m) {
      let hour = parseInt(m[1]!);
      const minute = parseInt(m[2]!);
      const ampm = m[3]!.toUpperCase();
      if (ampm === "PM" && hour < 12) hour += 12;
      if (ampm === "AM" && hour === 12) hour = 0;
      return { hour, minute };
    }
    return null;
  }

  const calendarEvents: {
    id: string;
    title: string;
    start: string;
    end: string;
    extendedProps: Record<string, unknown>;
  }[] =
    bookings
      ?.map((booking: BookingData) => {
        if (!booking?.slot?.start || !booking?.slot?.end || !booking?.date) {
          return null;
        }

        const startHM = parseHoursMinutes(booking.slot.start);
        const endHM = parseHoursMinutes(booking.slot.end);
        if (!startHM || !endHM) {
          return null;
        }

        const startDate = new Date(booking.date);
        startDate.setHours(startHM.hour, startHM.minute, 0, 0);

        const endDate = new Date(booking.date);
        endDate.setHours(endHM.hour, endHM.minute, 0, 0);

        return {
          id: String(
            startDate.getTime() +
              endDate.getTime() +
              booking.slot.id +
              booking.schedule +
              booking.facility.id,
          ),
          title: `${booking.facility.name} - ${booking.user.name}`,
          start: toLocalIsoNoZ(startDate),
          end: toLocalIsoNoZ(endDate),
          extendedProps: {
            status: booking.status,
            description: booking.description,
            userEmail: booking.user.email,
            userPhone: booking.user.phone,
            facilityId: booking.facility.id,
            slotId: booking.slot.id,
            scheduleId: booking.schedule,
          },
        };
      })
      .filter((e): e is NonNullable<typeof e> => e !== null) ?? [];

  const initialDate: string =
    calendarEvents.length > 0
      ? calendarEvents[0]!.start
      : toLocalIsoNoZ(new Date());

  return (
    <>
      <div className="flex flex-col gap-4 border-b p-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <Image
            src="https://ik.imagekit.io/ttltz/brands/one/one-colored_H32SW3x_4.png?updatedAt=1757667292237"
            alt="Karimjee Logo"
            width={150}
            height={50}
            className="object-contain"
          />
        </div>

        <div className="absolute top-4 right-4 z-50">
          <SignOutButton />
        </div>
      </div>

      <div>
        <AddEventDialog>
          <Button className="w-full sm:w-auto">
            <Plus />
            Book Event
          </Button>
        </AddEventDialog>
      </div>

      <div className="p-2">
        <FullCalendar
          height={"70vh"}
          weekends={false}
          hiddenDays={[]}
          events={calendarEvents}
          plugins={[dayGridPlugin, TimeGridPlugin, InteractionPlugin]}
          initialView="timeGridWeek"
          initialDate={initialDate}
          nowIndicator={true}
          allDaySlot={false}
          slotMinTime={"07:00:00"}
          slotMaxTime={"18:00:00"}
          editable={false}
          slotDuration={"00:30:00"}
          headerToolbar={
            {
              // left: "prev,next",
              // center: "title",
              // right: "timeGridWeek,timeGridDay", // user can switch between the two
            }
          }
        />
      </div>
    </>
  );
}
