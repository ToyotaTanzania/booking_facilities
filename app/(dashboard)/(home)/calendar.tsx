"use client";

import { ClientContainer } from "@/calendar/components/client-container";
import { CalendarProvider } from "@/calendar/contexts/calendar-context";

import { api } from "@/trpc/react";
import type { IEvent } from "@/calendar/interfaces";

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

interface UserData {
  userid: string;
  name: string;
  avatar_url: string | null;
}

export function BookingsCalendar() {
  const { data: bookings, isLoading: bookingsLoading } =
    api.booking.getCalendarBookings.useQuery();
  const { data: users, isLoading: usersLoading } = api.user.getUsers.useQuery();

  if (bookingsLoading) {
    return <div>Loading bookings...</div>;
  }

  if (usersLoading) {
    return <div>Loading...</div>;
  }

  const events: IEvent[] =
    bookings
      ?.map((booking: BookingData) => {
        if (!booking.slot?.start || !booking.slot?.end) return null;

        const [startHour, startMinute] = booking.slot.start.split(":");
        const [endHour, endMinute] = booking.slot.end.split(":");

        if (!startHour || !startMinute || !endHour || !endMinute) return null;

        const startDate = new Date(booking.date);
        startDate.setHours(parseInt(startHour), parseInt(startMinute), 0, 0);

        const endDate = new Date(booking.date);
        endDate.setHours(parseInt(endHour), parseInt(endMinute), 0, 0);

        return {
          id:
            startDate.getTime() +
            endDate.getTime() +
            booking.slot.id +
            booking.schedule +
            booking.facility.id,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          title: `${booking.facility.name} - ${booking.user.email}`,
          color:
            booking.status === "confirmed"
              ? "green"
              : booking.status === "rejected"
                ? "red"
                : "yellow",
          description: `${booking.description} ${booking.user.phone ?? ""}`,
          user: {
            id: booking.user.userid,
            name: booking.user.name,
            picturePath: null,
          },
        };
      })
      .filter((event): event is NonNullable<typeof event> => event !== null) ??
    [];

  return (
    <CalendarProvider
      className="w-full"
      users={
        users?.map((user: UserData) => ({
          id: user.userid,
          name: user.name,
          picturePath: user.avatar_url,
        })) ?? []
      }
      events={events}
    >
      <ClientContainer view="week" />
    </CalendarProvider>
  );
}
