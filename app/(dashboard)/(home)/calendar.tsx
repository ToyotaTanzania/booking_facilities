"use client";

import { api } from "@/trpc/react";
import { Loader2 } from "lucide-react";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import TimeGridPlugin from "@fullcalendar/timegrid";
import InteractionPlugin from "@fullcalendar/interaction";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useState } from "react";
import type { EventContentArg, EventClickArg, EventMountArg } from "@fullcalendar/core";

// import './calendar.css'

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

type EventExtra = {
  status: string;
  description: string | null;
  userEmail: string;
  userPhone: string | null;
  facilityId: number;
  slotId: number;
  scheduleId: number;
  facilityName: string;
  userName: string;
  buildingName?: string;
  buildingLocation?: string;
};

type SelectedEvent = {
  title: string;
  start: string;
  end: string;
  status: string;
  description: string;
  facilityName: string;
  buildingName?: string;
  buildingLocation?: string;
  userName: string;
  userEmail: string;
  userPhone: string;
};

export function BookingsCalendar() {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<SelectedEvent | null>(null)
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
          groupId: `${booking.date}-${booking.user.userid}`,
          className: "cursor-pointer text-xs",
          title: `${booking.facility.name} - ${booking.facility.building?.name ?? ''} - ${booking.facility.building?.location ?? ''} - ${booking.user.name}`,
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
          initialView="timeGridDay"
          initialDate={initialDate}
          nowIndicator={true}
          allDaySlot={false}
          slotMinTime={"07:00:00"}
          slotMaxTime={"18:00:00"}
          slotDuration={"00:10:00"}
          eventDisplay="block"
          eventContent={(arg: EventContentArg) => {
            const p = arg.event.extendedProps as EventExtra;
            const facilityName = p?.facilityName ?? '';
            const buildingName = p?.buildingName ?? '';
            const buildingLocation = p?.buildingLocation ?? '';
            const userName = p?.userName ?? '';
            return {
              domNodes: [
                (() => {
                  const container = document.createElement('div');
                  container.className = 'flex flex-col';
                  container.innerHTML = `
                    <div class="flex flex-col flex-wrap">
                      <span class="text-xs">${facilityName}-${buildingName}-${buildingLocation}</span>
                      <span class="ext-xs">${userName ?? ''}</span>
                    </div>
                  `;
                  return container;
                })(),
              ],
            };
          }}
          eventDidMount={(info: EventMountArg) => {
            const status = (info.event.extendedProps as EventExtra)?.status;
            if (status && info.el) {
              info.el.setAttribute('data-status', status);
            }
          }}
          eventClick={(arg: EventClickArg) => {
            const ev = arg.event
            const p = ev.extendedProps as EventExtra
            setSelectedEvent({
              title: ev.title,
              start: ev.start?.toISOString() ?? '',
              end: ev.end?.toISOString() ?? '',
              status: p?.status ?? '',
              description: p?.description ?? '',
              facilityName: p?.facilityName ?? '',
              buildingName: p?.buildingName ?? '',
              buildingLocation: p?.buildingLocation ?? '',
              userName: p?.userName ?? '',
              userEmail: p?.userEmail ?? '',
              userPhone: p?.userPhone ?? ''
            })
            setSheetOpen(true)
            arg.jsEvent.preventDefault()
          }}
          headerToolbar={
            {
              // left: "prev,next",
              // center: "title",
              // right: "timeGridWeek,timeGridDay", // user can switch between the two
            }
          }
        />
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetContent side="right" className="w-[420px] p-2 sm:w-[480px]">
            <SheetHeader>
              <SheetTitle className="text-base">
                {selectedEvent?.facilityName ?? ''}
              </SheetTitle>
              <SheetDescription>
                <span>
                  {selectedEvent?.buildingName ?? ''}
                  {selectedEvent?.buildingLocation ? `, ${selectedEvent?.buildingLocation}` : ''}
                </span>
              </SheetDescription>
            </SheetHeader>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className="font-medium capitalize">{selectedEvent?.status ?? ''}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Starts</span>
                <span className="font-medium">{selectedEvent?.start ? new Date(selectedEvent.start).toLocaleString() : ''}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ends</span>
                <span className="font-medium">{selectedEvent?.end ? new Date(selectedEvent.end).toLocaleString() : ''}</span>
              </div>
              <div className="pt-2 border-t">
                <div className="font-medium">Booked by</div>
                <div>{selectedEvent?.userName ?? ''}</div>
                <div className="text-muted-foreground">{selectedEvent?.userEmail ?? ''}{(selectedEvent?.userPhone ? ` · ${selectedEvent.userPhone}` : '')}</div>
              </div>
              {(selectedEvent?.description ? (
                <div className="pt-2 border-t">
                  <div className="font-medium">Description</div>
                  <div className="whitespace-pre-wrap">{selectedEvent.description}</div>
                </div>
              ) : null)}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
