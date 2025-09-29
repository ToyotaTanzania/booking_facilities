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

// import './calendar.css'
import { group, info } from "console";

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
    building?: { name: string; location: string };
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
          groupId: `${booking.facility.date}-${booking.user.userid}`,
          className: "cursor-pointer text-xs",
          title: `${booking.facility.name} - ${booking.facility.building?.name} - ${booking?.facility?.building?.location} - ${booking.user.name}`,
          start: toLocalIsoNoZ(startDate),
          end: toLocalIsoNoZ(endDate),
          color: booking.status === "confirmed" ? "green" : booking.status === "pending" ? "orange" : "red",
          textColor: "white",
          // display: 'inverse-background',
          overlap: false,
          extendedProps: {
            status: booking.status,
            description: booking.description,
            userEmail: booking.user.email,
            userPhone: booking.user.phone,
            facilityId: booking.facility.id,
            slotId: booking.slot.id,
            scheduleId: booking.schedule,
            facilityName: booking.facility.name,
            userName: booking.user.name,
            buildingName: booking.facility?.building?.name,
            buildingLocation: booking.facility?.building?.location,
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
      <div className="p-2">
        <FullCalendar
          height={"100vh"}
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
          slotDuration={"00:10:00"}
          eventDisplay="block"
          eventContent={(arg) => {
            const p = arg.event.extendedProps as any;
            const status = (p?.status as string) ?? '';
            const facilityName = (p?.facilityName as string) ?? '';
            const buildingName = (p?.buildingName as string) ?? '';
            const buildingLocation = (p?.buildingLocation as string) ?? '';
            const userName = (p?.userName as string) ?? '';
            const email = (p?.userEmail as string) ?? '';
            const phone = (p?.userPhone as string | null) ?? '';
            const description = (p?.description as string | null) ?? '';
            return {
              domNodes: [
                (() => {
                  const container = document.createElement('div');
                  container.className = 'flex flex-col';
                  container.innerHTML = `
                    <div class="flex flex-col flex-wrap">
                      <span class="text-xs">${facilityName}-${buildingName}-${buildingLocation}</span>
                      <span class="ext-xs">${userName || ''}</span>
                    </div>
                  `;
                  return container;
                })(),
              ],
            };
          }}
          eventDidMount={(info) => {
            const status = (info.event.extendedProps as any)?.status as string | undefined;
            if (status && info.el) {
              info.el.setAttribute('data-status', status);
            }
          }}
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
