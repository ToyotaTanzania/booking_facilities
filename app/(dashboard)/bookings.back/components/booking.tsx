'use client'

import { useAtom } from "jotai"
import { bookingFiltersAtom } from "@/store/booking"
import { api } from "@/trpc/react"
import { DailyCalendar } from "./calendar"

export const BookingForm = ( ) => {
  const [{ 
    date,
    facility,
    building,
    location,
  }] = useAtom(bookingFiltersAtom)

  const { data: allFacilities, isLoading } = api.facility.getAllByDate.useQuery({ 
    date: date ? new Date(date) : new Date(),
    facility: facility?.id ?? null,
    building: building?.id ?? null,
    location: location?.id   ?? null,
  },{ 
    enabled: !!date,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: 1000 * 60 * 5,
    refetchIntervalInBackground: true,
  })  

  if ( isLoading) {
    return <div>Loading...</div>
  }

  return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
      {/* <DailyCalendar 
        slots={schedule?.slots ?? []}  
        date={filters.date ? new Date(filters.date) : new Date()}
        building={room?.building?.name}
        location={room?.building?.location?.name}
        room={room?.name} /> */}
        {
          allFacilities?.map((facility) => (
            <DailyCalendar 
              date={date ? new Date(date) : new Date()}
              room={facility} 
              key={facility.id}
            />
          ))
        }
  </div>
}