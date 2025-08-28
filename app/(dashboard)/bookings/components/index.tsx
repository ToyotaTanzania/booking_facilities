'use client'

import { BookingFilterMenuResponsive } from "@/components/booking";
import { useBookingFilters } from "@/store/use-booking-filters";

export function BookingsList() {
  const { filters, hasActiveFilters } = useBookingFilters();

  return (
    <div>
      <BookingFilterMenuResponsive />
      {/* Your booking list component */}
    </div>
  );
}