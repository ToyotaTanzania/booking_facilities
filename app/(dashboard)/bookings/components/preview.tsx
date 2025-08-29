'use client'

import { useAtom } from "jotai"
import { bookingFiltersAtom } from "@/store/booking"
import { api } from "@/trpc/react"

export const BookingPreview = () => {
  const [filters] = useAtom(bookingFiltersAtom)


  const { data: bookings } = api.booking.getBookings.useQuery({
    ...filters,
  })
  
  return (
    <div>
      <h1>Booking Preview</h1>
      <p>Filters: {JSON.stringify(filters)}</p>
      <p>Bookings: {JSON.stringify(bookings)}</p>
    </div>
  )
}