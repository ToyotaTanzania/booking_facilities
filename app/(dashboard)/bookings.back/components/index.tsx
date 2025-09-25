'use client'

import { BookingFilterMenuResponsive } from "@/components/booking";
import { useBookingFilters } from "@/store/use-booking-filters";

export function BookingsList() {
  return (
    <div>
      <BookingFilterMenuResponsive />
      {/* Your booking list component */}
    </div>
  );
}