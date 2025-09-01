'use client'

import { useAtom } from "jotai"
import { bookingFiltersAtom } from "@/store/booking"
import { BookingForm } from "./booking"
import { format } from "date-fns"

export const BookingPreview = () => {
  const [{date}] = useAtom(bookingFiltersAtom)

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Booking {date ? format(new Date(date), "EEEE, MMMM d, yyyy") : ''} </h1>
      <BookingForm /> 
    </div>
  )
}