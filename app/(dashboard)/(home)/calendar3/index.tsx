"use client";

import { IlamyResourceCalendar } from '@ilamy/calendar';
import type { Resource, ResourceCalendarEvent } from '@ilamy/calendar';
import dayjs from 'dayjs';
import { faker } from "@faker-js/faker"
import { capitalize } from "lodash"

import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { useMemo, useState } from 'react';
import { api } from '@/trpc/react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(timezone);
dayjs.extend(utc);

const statuses = [
  { id: faker.string.uuid(), name: "Planned", color: "#6B7280" },
  { id: faker.string.uuid(), name: "In Progress", color: "#F59E0B" },
  { id: faker.string.uuid(), name: "Done", color: "#10B981" },
];


const resources: Resource[] = [
  {
    id: 'room-a',
    title: 'Conference Room A',
    color: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  {
    id: 'room-b',
    title: 'Conference Room B',
    color: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
];

const events: ResourceCalendarEvent[] = [
  {
    id: 'event-1',
    title: 'Team Meeting',
    start: dayjs('2025-08-04T09:00:00.000Z'),
    end: dayjs('2025-08-04T10:00:00.000Z'),
    uid: 'event-1@ilamy.calendar',
    resourceId: 'room-a', // Assigned to Room A
  },
];

export default function KarimjeeCalendar() {
  const [selectedLocation, selectLocation] = useState<string | null>(null);
  const [selectedBuilding, selectBuilding] = useState<number | null>(null);
  const [selectedFacility, selectFacility] = useState<number | null>(null);
  // IlamyResourceCalendar handles date/view navigation; we only keep custom filters

  // Bookings: single API call, driven by filters
  const { data: calendarBookings = [], isLoading: bookingsLoading } = api.booking.filteredBookings.useQuery({
    date: dayjs().format('YYYY-MM-DD'),
    interval: 'year',
    location: selectedLocation,
    building: selectedBuilding,
    facility: selectedFacility,
  });

  // Facilities: show all facilities in current scope (location/building) for resources
  const { data: facilities = [], isLoading: facilitiesLoading } = api.facility.list.useQuery();

  const locations = useMemo(() => {
    const set = new Set<string>();
    for (const f of facilities) {
      const loc = f?.building?.location;
      if (loc) set.add(loc);
    }
    return Array.from(set);
  }, [facilities]);

  const buildings = useMemo(() => {
    const map = new Map<number, { id: number; name: string }>();
    for (const f of facilities) {
      if (selectedLocation && f?.building?.location !== selectedLocation) continue;
      const building = f?.building;
      if (building?.id && !map.has(building.id)) {
        map.set(building.id, { id: building.id, name: building.name });
      }
    }
    return Array.from(map.values());
  }, [facilities, selectedLocation]);

  const resourceFacilities: Resource[] = useMemo(() => {
    return facilities
      // .filter((f) => (selectedLocation ? f?.building?.location === selectedLocation : true))
      // .filter((f) => (selectedBuilding ? f?.building?.id === selectedBuilding : true))
      .map((facility) => ({
        id: facility.id.toString(),
        title: `${facility.name}${facility?.building?.name ? ` (${facility.building.name})` : ''}`,
        color: facility.color || '#3B82F6',
        backgroundColor: facility.backgroundColor || '#EFF6FF',
      }));
  }, [facilities, selectedLocation, selectedBuilding]);
  
  // Keep the page visible; show skeleton only for resources when facilities are loading

  return (
    <div className="relative">
      <div className="mb-2 flex w-full justify-end gap-2">
        <Select value={selectedLocation ?? ''} onValueChange={(v) => selectLocation(v === '__all__' ? null : v)}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Location" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All locations</SelectItem>
            {locations.map((loc) => (
              <SelectItem key={loc} value={loc}>{loc}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedBuilding?.toString() ?? ''} onValueChange={(v) => selectBuilding(v && v !== '__all__' ? Number(v) : null)}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Building" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All buildings</SelectItem>
            {buildings.map((b) => (
              <SelectItem key={b.id} value={b.id.toString()}>{b.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedFacility?.toString() ?? ''} onValueChange={(v) => selectFacility(v && v !== '__all__' ? Number(v) : null)}>
          <SelectTrigger className="w-[220px]"><SelectValue placeholder="Facility" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All facilities</SelectItem>
            {facilities.map((f) => (
              <SelectItem key={f.id} value={f.id.toString()}>{f.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Use IlamyResourceCalendar's controls for date/view; only custom filters here */}
      </div>
      {/* Resource viewer skeleton (left column) while facilities are loading */}
      {facilitiesLoading && (
        <div className="absolute left-0 top-12 z-10 h-[calc(100%-4rem)] w-64">
          <div className="flex flex-col gap-2 p-2">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-5/6" />
            <Skeleton className="h-6 w-4/6" />
            <Skeleton className="h-6 w-3/6" />
          </div>
        </div>
      )}

      <IlamyResourceCalendar
        resources={resourceFacilities || []}
        events={calendarBookings
          .filter((booking) => !selectedFacility || booking?.facility?.id === selectedFacility)
          .map((booking) => ({
          id: booking.id,
          title: `${booking.facility?.name || ''} — ${booking.status || ''}`,
          start: dayjs(booking.start),
          end: dayjs(booking.end),
          uid: `booking-${booking.id}@ilamy.calendar`,
          resourceId: booking.facility?.id ? booking.facility.id.toString() : '',
        }))}
        firstDayOfWeek="monday"
        initialView="week"
      />

      {/* <IlamyCalendar 
        events={exampleFeatures} 
        firstDayOfWeek="monday"
        stickyViewHeader={true}
        disableCellClick={true}
        disableDragAndDrop={true}
        initialView="week"
        renderEvent={
          (calendarEvent) => {
            console.log(calendarEvent)
            return (
              <div className="bg-red-500 text-white p-2 rounded-md">
                {calendarEvent.title}
              </div>
            )
          }
        }
      /> */}
    </div>
  );
}
