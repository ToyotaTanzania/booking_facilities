"use client";

import { useEffect, useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { api } from "@/trpc/react";

import {
  MiniCalendar,
  MiniCalendarDay,
  MiniCalendarDays,
  MiniCalendarNavigation,
} from "@/components/ui/mini-calendar";

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

import numeral from "numeral";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { z } from "zod";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  email: z.string().email("Please enter a valid email"),
  title: z.string().min(2, "Title must be at least 2 characters").max(50),
  // Track selected slot ids as strings; convert to numbers on submit
  // Keep required to align resolver types
  slots: z.array(z.string()),
});

type GuestFormValues = z.infer<typeof formSchema>;
type Slot = { id: number; start: string; end: string };

export const GuestBookingForm = () => {
  const [location, setLocation] = useState<string>("");
  const [facility, setFacility] = useState<string>("");
  const [building, setBuilding] = useState<number>(0);

  const [schedule, setSchedule] = useState<number>(0);
  const [slots, setSlots] = useState<Slot[]>([]);

  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const debouncedDate = useDebounce(currentDate, 500);

  const [locationOpen, setLocationOpen] = useState<boolean>(false);
  const [facilityOpen, setFacilityOpen] = useState<boolean>(false);
  const [buildingOpen, setBuildingOpen] = useState<boolean>(false);

  const debouncedLocation = useDebounce(location, 500);
  const debouncedFacility = useDebounce(facility, 500);
  const debouncedBuilding = useDebounce(building, 500);

  const { data: locations, isLoading: isLoadingLocations } =
    api.location.list.useQuery();
  const { data: buildings, isLoading: isLoadingBuildings } =
    api.building.filtered.useQuery(
      {
        location: debouncedLocation,
      },
      {
        enabled: Boolean(debouncedLocation),
      },
    );
  const { data: facilities, isLoading: isLoadingFacilities } =
    api.facility.filtered.useQuery(
      {
        building: debouncedBuilding,
      },
      {
        enabled: Boolean(debouncedBuilding),
      },
    );
  const { data: schedules, isLoading: isLoadingSchedule } =
    api.schedule.getById.useQuery(schedule, {
      enabled: Boolean(schedule),
    });

  const { data: filteredBookings, isLoading: loadingFilteredBookings } =
    api.booking.searchBookings.useQuery({
      // date: currentDate.toISOString(),
      date: debouncedDate.toISOString() ?? new Date().toString(),
      location: debouncedLocation ?? "",
      facility: numeral(debouncedFacility).value() || undefined,
      building: numeral(debouncedBuilding).value() || undefined,
    });

  useEffect(() => {
    if (debouncedFacility) {
      const facility = facilities?.find(
        (f) => f.id === numeral(debouncedFacility).value(),
      );
      setSchedule(facility?.schedule || 0);
    }
  }, [debouncedFacility]);

  useEffect(() => {
    if (schedules) {
      console.log("schedule", schedules);
      setSlots(((schedules as any)?.slots as Slot[]) || []);
    }
  }, [schedules]);

  useEffect(() => {
    if (filteredBookings) {
      console.log(filteredBookings);
    }
  }, [filteredBookings]);

  const form = useForm<GuestFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      title: "",
      slots: [],
    },
  });

  // Range selection state for Shift-click
  const [lastSlotIndex, setLastSlotIndex] = useState<number | null>(null);

  // Already booked slots for the selected filters/date
  const bookedSlotIds = (filteredBookings || [])
    .map((b: any) => b?.slot?.id)
    .filter((id: any) => typeof id === "number");

  const isSlotBooked = (slotId: number) => bookedSlotIds.includes(slotId);

  const onSubmit: SubmitHandler<GuestFormValues> = (values) => {
    // Unified payload containing all required fields
    const payload = {
      date: debouncedDate?.toISOString?.() || new Date().toISOString(),
      facility: numeral(facility).value() || 0,
      name: values.name,
      email: values.email,
      title: values.title,
      // Convert slot ids to numbers as required by booking APIs
      slots: (values.slots || []).map((s) => Number(s)).filter((n) => !Number.isNaN(n)),
    };

    console.log("Guest Booking Submit", payload);
  };

  return (
    <div className="px-4 md:px-6 max-w-screen-md mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4 w-full space-y-8">
          <div className="flex w-full flex-col md:flex-row md:justify-between gap-4">
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
            data={(locations || []).map((l: any) => ({
              label: l.name,
              value: l.name,
            }))}
            open={locationOpen}
            onOpenChange={(open) => setLocationOpen(open)}
            type="location"
            value={location}
            onValueChange={setLocation}
          >
            <ComboboxTrigger className="w-full md:w-64" />
            <ComboboxContent className="w-full md:w-64">
              <ComboboxInput />
              <ComboboxEmpty />
              <ComboboxList>
                <ComboboxGroup className="w-full md:w-64">
                  {locations?.map((location) => (
                    <ComboboxItem
                      className="w-full md:w-64"
                      key={location.name}
                      value={location.name}
                    >
                      {location.name}
                    </ComboboxItem>
                  ))}
                </ComboboxGroup>
              </ComboboxList>
            </ComboboxContent>
          </Combobox>

          <Combobox
            data={(buildings || []).map((b: any) => ({
              label: b.name,
              value: b.id.toString(),
            }))}
            open={buildingOpen}
            onOpenChange={(open) => setBuildingOpen(open)}
            type="building"
            value={building ? building.toString() : ""}
            onValueChange={(val) => setBuilding(Number(val) || 0)}
          >
            <ComboboxTrigger className="w-full md:w-64" />
            <ComboboxContent className="w-full md:w-64">
              <ComboboxInput />
              <ComboboxEmpty>
                {location === ""
                  ? "Select a location first"
                  : isLoadingBuildings
                    ? "Fetching buildings..."
                    : "No buildings found"}
              </ComboboxEmpty>
              <ComboboxList>
                <ComboboxGroup className="w-full md:w-64">
                  {buildings?.map((building) => (
                    <ComboboxItem
                      className="w-full md:w-64"
                      key={building.id.toString()}
                      value={building.id.toString()}
                    >
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
            <ComboboxTrigger className="w-full md:w-64" />
            <ComboboxContent className="w-full md:w-64">
              <ComboboxInput />
              <ComboboxEmpty />
              <ComboboxList>
                <ComboboxGroup className="w-full md:w-64">
                  {facilities?.map((facility) => (
                    <ComboboxItem
                      className="w-full md:w-64"
                      key={facility.id.toString()}
                      value={facility.id.toString()}
                    >
                      {facility.name}
                    </ComboboxItem>
                  ))}
                </ComboboxGroup>
              </ComboboxList>
            </ComboboxContent>
          </Combobox>

          <Button
            type="button"
            onClick={() => {
              // Clear all selections and form fields
              setLocation("");
              setBuilding(0);
              setFacility("");
              setCurrentDate(new Date());
              setSchedule(0);
              setSlots([]);
              setLastSlotIndex(null);
              form.reset({ name: "", email: "", title: "", slots: [] });
            }}
          >
            Clear
          </Button>
        </MiniCalendar>
      </div>
      <div className="flex flex-col md:flex-row md:justify-between gap-4 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Title of the meeting" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="slots"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Time Slots</FormLabel>

                  <FormControl>
                    <div className="grid max-h-60 grid-cols-2 md:grid-cols-3 gap-2 overflow-y-auto rounded-md bg-gray-100 p-4">
                      {schedule && slots?.length ? (
                        slots.map((slot: Slot, index) => {
                          const value = String(slot?.id);
                          const inputId = `slot-${value}`;
                          const isChecked =
                            Array.isArray(field.value) &&
                            field.value.includes(value);
                          const booked = isSlotBooked(Number(value));
                          return (
                            <div
                              key={value}
                              className={`flex items-center gap-2 rounded-sm p-2 ${booked ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                              onClick={(e) => {
                                if (booked) return;
                                const shift = e.shiftKey;
                                const currentSelected = new Set<string>(field.value ?? []);
                                if (shift && lastSlotIndex !== null) {
                                  const [start, end] = index < lastSlotIndex ? [index, lastSlotIndex] : [lastSlotIndex, index];
                                  for (let i = start; i <= end; i++) {
                                    const v = String((slots[i] as Slot)?.id);
                                    if (!isSlotBooked(Number(v))) {
                                      currentSelected.add(v);
                                    }
                                  }
                                } else {
                                  if (currentSelected.has(value)) currentSelected.delete(value);
                                  else currentSelected.add(value);
                                }
                                field.onChange(Array.from(currentSelected));
                                setLastSlotIndex(index);
                              }}
                            >
                              <Checkbox
                                id={inputId}
                                className="border-black pointer-events-none"
                                checked={isChecked}
                                disabled={booked}
                              />
                              <Label htmlFor={inputId}>
                                {slot.start} - {slot.end}
                              </Label>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-sm text-gray-500">
                          Please select a room to see available time slots.
                        </p>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Booked slots list intentionally omitted to keep form minimal */}

            <Button
              type="submit"
              className="cursor-pointer"
              disabled={!debouncedFacility && !debouncedDate}
            >
              Submit
            </Button>
          </div>
          </form>
        </Form>
    </div>
  );
};
