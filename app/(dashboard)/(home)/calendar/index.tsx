"use client";
import { faker } from "@faker-js/faker";
import {
  KanbanBoard,
  KanbanCard,
  KanbanCards,
  KanbanHeader,
  KanbanProvider,
} from "@/src/components/ui/shadcn-io/kanban";
import { useEffect, useState } from "react";
import { api } from "@/trpc/react";
import _ from "lodash";
import EventItem from "./eventItem";
import { useDebounce } from "@/hooks/use-debounce";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from "@/src/components/kibo-ui/combobox";

import numeral from 'numeral'

const frameworks = [
  {
    value: "next.js",
    label: "Next.js",
  },
  {
    value: "sveltekit",
    label: "SvelteKit",
  },
  {
    value: "nuxt.js",
    label: "Nuxt.js",
  },
  {
    value: "remix",
    label: "Remix",
  },
  {
    value: "astro",
    label: "Astro",
  },
  {
    value: "vite",
    label: "Vite",
  },
];

import {
  MiniCalendar,
  MiniCalendarDay,
  MiniCalendarDays,
  MiniCalendarNavigation,
} from "@/components/ui/mini-calendar";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, ArrowRightIcon, Icon } from "lucide-react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";

const KarimjeeCalendar = () => {
  const [bookings, setBookings] = useState<any>([]);
  // Use a simple controlled string state to match Combobox typing
  const [location, setLocation] = useState<string>("");
  const [locationOpen, setLocationOpen] = useState<boolean>(false);
  const debouncedLocation = useDebounce(location, 800);

  const [building, setBuilding] = useState<number>(0); 
  const [buildingOpen, setBuildingOpen] = useState<boolean>(false);
  const debouncedBuilding = useDebounce(building, 800,);

  const [facility, setFacility] = useState<string>(""); 
  const [facilityOpen, setFacilityOpen] = useState<boolean>(false);
  const debouncedFacility = useDebounce(facility, 800);

  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const debouncedDate = useDebounce(currentDate, 800)

  const { data: facilities, isLoading: loadingFacilities } = api.facility.filtered.useQuery({
    building: numeral(debouncedBuilding).value() || undefined,
    location: debouncedLocation,
    facility: numeral(debouncedFacility).value() || undefined,
  },);

  const { data: allBookings, isLoading: loadingBookings } =
    api.booking.filteredBookings.useQuery({
      // date: currentDate.toISOString(),
      date: undefined,
    });

  const { data: allLocations, isLoading: loadingLocations } =api.location.list.useQuery();
  const { data: allBuildings, isLoading: loadingBuildings } = api.building.filtered.useQuery({
    location: debouncedLocation,
  },{ 
    enabled: debouncedLocation !== "",
  });

  const { data: filteredBookings, isLoading: loadingFilteredBookings } =
    api.booking.searchBookings.useQuery({
      // date: currentDate.toISOString(),
      date: debouncedDate.toISOString() ?? new Date().toString(),
      location: debouncedLocation ?? "",
      facility: numeral(debouncedFacility).value() || undefined,
      building: numeral(debouncedBuilding).value() || undefined,
    });

  useEffect(
    ()=>{ 
      console.log(filteredBookings)
    },
    [filteredBookings]
  )
  

  useEffect(() => {
    if (!allBookings || allBookings.length === 0) return;
    const groupedBookings = _.groupBy(allBookings, "code");
    const mapped = _.map(groupedBookings, (record, code) => {
      const sorted = _.sortBy(record, "slot.start");

      const first = sorted[0];
      const last = sorted[sorted.length - 1];

      return {
        id: code,
        date: first.date,
        name: first.description || "",
        start: first.start,
        end: last.end,
        startSlot: first.slot.start,
        endSlot: last.slot.end,
        uid: code,
        column: first.facility?.id ? first.facility.id.toString() : "",
        owner: first.user,
        status: first.status,
        description: first?.user?.name || first?.description || "",
        // resourceId: first.facility?.id ? first.facility.id.toString() : "",
      };
    });
    setBookings(mapped);
  }, [allBookings]);

  return (
    <div className="space-y-4">
      <div className="flex w-full justify-between">
        <MiniCalendar
          days={5}
          value={currentDate}
          onValueChange={(date) => setCurrentDate(date || new Date())}
          className="w-full"
        >
          {/* <MiniCalendarNavigation direction="prev" /> */}
          {/* <MiniCalendarNavigation asChild direction="today"> */}
          <Button variant="outline" onClick={() => setCurrentDate(new Date())}>
            Today
          </Button>
          {/* </MiniCalendarNavigation> */}
          <MiniCalendarNavigation asChild direction="prev">
            <Button size="icon" variant="outline">
              <ArrowLeftIcon className="size-4" />
            </Button>
          </MiniCalendarNavigation>

          <MiniCalendarDays>
            {(date) => (
              <MiniCalendarDay
                className="cursor-pointer"
                date={date}
                key={date.toISOString()}
              />
            )}
          </MiniCalendarDays>

          {/* <MiniCalendarNavigation direction="next" /> */}
          <MiniCalendarNavigation asChild direction="next">
            <Button size="icon" variant="outline">
              <ArrowRightIcon className="size-4" />
            </Button>
          </MiniCalendarNavigation>

          <Combobox
            data={(allLocations || []).map((l: any) => ({
              label: l.name,
              value: l.name,
            }))}
            open={locationOpen}
            onOpenChange={(open) => setLocationOpen(open)}
            type="location"
            value={location}
            onValueChange={setLocation}
          >
            <ComboboxTrigger className="w-[200px]" />
            <ComboboxContent className="w-[200px]">
              <ComboboxInput />
              <ComboboxEmpty />
              <ComboboxList>
                <ComboboxGroup className="w-[200px]">
                  {allLocations?.map((location) => (
                    <ComboboxItem className="w-[200px]" key={location.name} value={location.name}>
                      {location.name}
                    </ComboboxItem>
                  ))}
                </ComboboxGroup>
              </ComboboxList>
            </ComboboxContent>
          </Combobox>


          <Combobox
            data={(allBuildings || []).map((b: any) => ({
              label: b.name,
              value: b.id.toString(),
            }))}
            open={buildingOpen}
            onOpenChange={(open) => setBuildingOpen(open)}
            type="building"
            value={building ? building.toString() : ""}
            onValueChange={(val) => setBuilding(Number(val) || 0)}
          >
            <ComboboxTrigger className="w-[200px]" />
            <ComboboxContent className="w-[200px]">
              <ComboboxInput  />
              <ComboboxEmpty>
                {
                  location==="" ? "Select a location first" : 
                  (
                    loadingBuildings ? "Fetching buildings..." : "No buildings found"
                  )
                }
              </ComboboxEmpty>
              <ComboboxList>
                <ComboboxGroup className="w-[200px]">
                  {allBuildings?.map((building) => (  
                    <ComboboxItem className="w-[200px]" key={building.id.toString()} value={building.id.toString()}>
                      {building.name}
                    </ComboboxItem>
                  ))}
                </ComboboxGroup>
              </ComboboxList>
            </ComboboxContent>
          </Combobox>


           <Combobox
            data={(facilities || []).map((f: any) => ({
              label: f.name,
              value: f.id.toString(),
            }))}
            open={facilityOpen}
            onOpenChange={(open) => setFacilityOpen(open)}
            type="facility"
            value={facility}
            onValueChange={setFacility}
          >
            <ComboboxTrigger className="w-[200px]" />
            <ComboboxContent className="w-[200px]">
              <ComboboxInput />
              <ComboboxEmpty />
              <ComboboxList>
                <ComboboxGroup className="w-[200px]">
                  {facilities?.map((facility) => (   
                    <ComboboxItem className="w-[200px]" key={facility.id.toString()} value={facility.id.toString()}>
                      {facility.name}
                    </ComboboxItem>
                  ))}
                </ComboboxGroup>
              </ComboboxList>
            </ComboboxContent>
          </Combobox>

          <Button
            onClick={() => {
              setLocation("");
              setBuilding(0);
              setFacility("");
              setCurrentDate(new Date());
            }}
          >
            Clear Filters
          </Button>


        </MiniCalendar>
      </div>

      <KanbanProvider
        columns={
          facilities?.map((f) => ({
            id: f.id.toString(),
            name: f.name,
            color: f.color || "#6B7280",
          })) || []
        }
        data={bookings}
        onDataChange={setBookings}
      >
        {(column) => (
          <KanbanBoard
            id={column.id}
            key={column.id}
            className="overflow-x-scroll"
          >
            <KanbanHeader>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full" />
                <span>{column.name}</span>
              </div>
            </KanbanHeader>
            {bookings.some((b: any) => b.column === column.id) ? (
              <KanbanCards id={column.id} className="w-[200px]">
                {(feature: any) => (
                  <KanbanCard
                    draggable={false}
                    column={column.id}
                    id={feature.id}
                    key={feature.id}
                    name={feature.name}
                  >
                    <EventItem event={feature} />
                  </KanbanCard>
                )}
              </KanbanCards>
            ) : (
              <Empty className="gap-3 p-4 md:p-4">
                <EmptyHeader className="gap-1">
                  <EmptyTitle className="text-sm">Empty</EmptyTitle>
                  <EmptyDescription className="text-xs">
                    No booking found
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent className="text-xs">
                  {/* Optional actions */}
                </EmptyContent>
              </Empty>
            )}
            {/* Compact empty state shown above when column has no items */}
          </KanbanBoard>
        )}
      </KanbanProvider>
    </div>
  );
};
export default KarimjeeCalendar;
