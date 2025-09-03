'use client'

import { ClientContainer } from "@/calendar/components/client-container";
import { CalendarProvider } from "@/calendar/contexts/calendar-context";
import { api } from "@/trpc/react";

export function BookingsCalendar() {

  const { data: bookings } = api.booking.getCalendarBookings.useQuery()

  console.log(bookings)

  return (
    <CalendarProvider users={[]} events={bookings?.map((booking) => ({
      id: new Date(booking.date).getTime()  + booking.slot + booking.schedule + booking.facility,
      startDate: booking.date,
      endDate: booking.date,
      title: booking.description,
      color: "blue",
      description: booking.description,
      user: booking.user,
    })) ?? []}>
      <ClientContainer view="week" />
    </CalendarProvider> 
  );
}