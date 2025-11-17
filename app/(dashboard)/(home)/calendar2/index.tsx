"use client";
import { faker } from "@faker-js/faker";
import {
  CalendarBody,
  CalendarDate,
  CalendarDatePagination,
  CalendarDatePicker,
  CalendarHeader,
  CalendarItem,
  CalendarMonthPicker,
  CalendarProvider,
  CalendarYearPicker,
} from '@/src/components/ui/shadcn-io/calendar';

import { format, addDays, subDays } from "date-fns";
import { useMemo, useState } from "react";
import { api } from "@/trpc/react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";




const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);
const statuses = [
  { id: faker.string.uuid(), name: "Planned", color: "#6B7280" },
  { id: faker.string.uuid(), name: "In Progress", color: "#F59E0B" },
  { id: faker.string.uuid(), name: "Done", color: "#10B981" },
];
const exampleFeatures = Array.from({ length: 20 })
  .fill(null)
  .map(() => ({
    id: faker.string.uuid(),
    name: capitalize(faker.company.buzzPhrase()),
    startAt: faker.date.past({ years: 0.5, refDate: new Date() }),
    endAt: faker.date.future({ years: 0.5, refDate: new Date() }),
    status: faker.helpers.arrayElement(statuses),
  }));

const earliestYear =
  exampleFeatures
    .map((feature) => feature.startAt.getFullYear())
    .sort()
    .at(0) ?? new Date().getFullYear();

const latestYear =
  exampleFeatures
    .map((feature) => feature.endAt.getFullYear())
    .sort()
    .at(-1) ?? new Date().getFullYear();

// Get my bookings
// Group buy code
// Navigate Using Date

const KarimjeeCalendar = () => {
  const [today, setToday] = useState(new Date());
  const nextDay = () => {
    setToday(addDays(today, 1));
  };
  const prevDay = () => {
    setToday(subDays(today, 1));
  };
  const currentDay = () => {
    setToday(new Date());
  };

  // Filters state
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedBuildingId, setSelectedBuildingId] = useState<number | null>(null);
  const [selectedFacilityId, setSelectedFacilityId] = useState<number | null>(null);

  // Fetch options
  const { data: locations = [] } = api.location.list.useQuery();
  const { data: buildings = [] } = api.building.list.useQuery();
  const { data: facilities = [] } = api.facility.getAll.useQuery();

  // Derived options based on filters
  const filteredBuildings = useMemo(() => {
    return (buildings as any[]).filter((b) =>
      selectedLocation ? b.location === selectedLocation : true,
    );
  }, [buildings, selectedLocation]);

  const filteredFacilities = useMemo(() => {
    const facs = facilities as any[];
    if (selectedBuildingId) {
      return facs.filter((f) => f?.building?.id === selectedBuildingId);
    }
    if (selectedLocation) {
      return facs.filter((f) => f?.building?.location === selectedLocation);
    }
    return facs;
  }, [facilities, selectedBuildingId, selectedLocation]);

  // Load bookings and filter by selected Location/Building/Facility
  const { data: calendarBookings = [], isLoading: bookingsLoading } = api.booking.getCalendarBookings.useQuery();

  const filteredBookings = useMemo(() => {
    let result = (calendarBookings as any[]) ?? [];
    if (selectedFacilityId) {
      result = result.filter((b) => b?.facility?.id === selectedFacilityId);
    } else if (selectedBuildingId) {
      result = result.filter((b) => b?.facility?.building?.id === selectedBuildingId);
    } else if (selectedLocation) {
      result = result.filter((b) => b?.facility?.building?.location === selectedLocation);
    }
    return result;
  }, [calendarBookings, selectedFacilityId, selectedBuildingId, selectedLocation]);

  const statusColors: Record<string, string> = {
    pending: '#6B7280',
    confirmed: '#10B981',
    rejected: '#EF4444',
    cancelled: '#64748B',
  };

  const combineDateTime = (dateStr: string, timeStr?: string) => {
    try {
      if (!timeStr) return new Date(dateStr);
      const d = new Date(dateStr);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return new Date(`${yyyy}-${mm}-${dd}T${timeStr}`);
    } catch {
      return new Date(dateStr);
    }
  };

  const bookingFeatures = useMemo(() => {
    return filteredBookings.map((b: any) => ({
      id: String(b.id),
      name: b?.facility?.name ?? 'Booking',
      startAt: combineDateTime(b?.date, b?.slot?.start_time),
      endAt: combineDateTime(b?.date, b?.slot?.end_time),
      status: {
        id: b?.status ?? 'pending',
        name: (b?.status ?? 'pending').replace(/\b\w/g, (c: string) => c.toUpperCase()),
        color: statusColors[b?.status ?? 'pending'] ?? '#6B7280',
      },
      facilityName: b?.facility?.name,
      buildingName: b?.facility?.building?.name,
      locationName: b?.facility?.building?.location,
      requester: b?.user?.name ?? b?.description ?? '',
    }));
  }, [filteredBookings]);

  return (
    <CalendarProvider>
    <div className="flex items-center justify-between gap-4">
      <CalendarDate>
        <CalendarDatePicker>
          <CalendarMonthPicker />
        </CalendarDatePicker>
        <CalendarDatePagination />
      </CalendarDate>
      {/* Right-aligned filter menu */}
      <div className="ml-auto flex items-center gap-2">
        {/* Location Filter */}
        <Select
          value={selectedLocation ?? ""}
          onValueChange={(value) => {
            setSelectedLocation(value || null);
            // reset dependent selections
            setSelectedBuildingId(null);
            setSelectedFacilityId(null);
          }}
        >
          <SelectTrigger className="w-[180px]" aria-label="Location">
            <SelectValue placeholder="Location" />
          </SelectTrigger>
          <SelectContent>
            {(locations as any[]).map((loc) => (
              <SelectItem key={loc.name} value={loc.name}>
                {loc.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Building Filter (depends on Location) */}
        <Select
          value={selectedBuildingId ? String(selectedBuildingId) : ""}
          onValueChange={(value) => {
            const id = value ? Number(value) : null;
            setSelectedBuildingId(id);
            // Clear facility when building changes
            setSelectedFacilityId(null);
          }}
        >
          <SelectTrigger className="w-[200px]" aria-label="Building">
            <SelectValue placeholder="Building" />
          </SelectTrigger>
          <SelectContent>
            {filteredBuildings.map((b: any) => (
              <SelectItem key={b.id} value={String(b.id)}>
                {b.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Facility Filter (can depend on Location OR Building) */}
        <Select
          value={selectedFacilityId ? String(selectedFacilityId) : ""}
          onValueChange={(value) => {
            const id = value ? Number(value) : null;
            setSelectedFacilityId(id);
          }}
        >
          <SelectTrigger className="w-[220px]" aria-label="Facility">
            <SelectValue placeholder="Facility" />
          </SelectTrigger>
          <SelectContent>
            {filteredFacilities.map((f: any) => (
              <SelectItem key={f.id} value={String(f.id)}>
                {f.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
    <CalendarHeader />
    <CalendarBody features={bookingFeatures}>
      {({ feature }) => <CalendarItem feature={feature} key={feature.id} />}
    </CalendarBody>
  </CalendarProvider>
  );
};
export default KarimjeeCalendar;
