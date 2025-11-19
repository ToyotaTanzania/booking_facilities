"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";

import { useDebounce } from "@/hooks/use-debounce";

import {
  MiniCalendar,
  MiniCalendarDay,
  MiniCalendarDays,
  MiniCalendarNavigation,
} from "@/components/ui/mini-calendar";

import { useDisclosure } from "@/hooks/use-disclosure";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormLabel,
  FormItem,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";

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

import { eventSchema } from "@/calendar/schemas";

import type { TEventFormData } from "@/calendar/schemas";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import numeral from "numeral";
import { Input } from "@/components/ui/input";

interface IProps {
  children: React.ReactNode;
  date?: Date;
  location: string | number;
  building: string | number;
  room: string | number;
}
type Slot = { id: number; start: string; end: string };

export function GuestBookingForm({ children }: IProps) {

  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const form = useForm<TEventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      location: "",
      building: "",
      room: "",
      name: "",
      email: "",
      phone: "",
      title: "",
      slots: [],
      // date: dayjs(date ?? undefined),
      date: currentDate,
    },
  });
  // const [building, setBuilding] = useState<string>("");
  const [building, setBuilding] = useState<number>(0);
  const [location, setLocation] = useState<string>("");
  const [amenities, setAmenities] = useState<any[]>([]);
  const [facility, setFacility] = useState<string>("");

  const [schedule, setSchedule] = useState<number>(0);
  const [slots, setSlots] = useState([]);

  const debouncedDate = useDebounce(currentDate, 500);

  const [locationOpen, setLocationOpen] = useState<boolean>(false);
  const [facilityOpen, setFacilityOpen] = useState<boolean>(false);
  const [buildingOpen, setBuildingOpen] = useState<boolean>(false);

  const debouncedLocation = useDebounce(form.getValues('location'), 500);
  const debouncedBuilding = useDebounce(form.getValues('building'), 500);
  const debouncedFacility = useDebounce(form.getValues('room'), 500);

  // Slot selection state - simplified approach
  const [selectionMode, setSelectionMode] = useState<
    "none" | "single" | "range"
  >("none");
  const [rangeStart, setRangeStart] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const slotsContainerRef = useRef<HTMLDivElement>(null);

  const { data: locations, isLoading: isLoadingLocations } =
    api.location.list.useQuery();
  const { data: buildings, isLoading: isLoadingBuildings } =
    api.building.filtered.useQuery(
      {
        location: debouncedLocation ?? undefined,
      },
      {
        enabled: Boolean(debouncedLocation),
      },
    );
  const { data: facilities, isLoading: isLoadingFacilities } =
    api.facility.filtered.useQuery(
      {
        building: debouncedBuilding ?? undefined,
      },
      {
        enabled: Boolean(debouncedBuilding),
      },
    );
  const { data: schedules, isLoading: isLoadingSchedule } =
    api.schedule.getById.useQuery(schedule, {
      enabled: Boolean(schedule),
    });

  const utils = api.useUtils();

  const { mutate: createBooking } = api.booking.create.useMutation({
    onSuccess: async () => {
      toast.success("Booking created successfully");
      await utils.booking.getCalendarBookings.invalidate();
    },
    onError: () => {
      toast.error("Failed to create booking");
    },
  });

  useEffect(() => {
    if (schedules) {
      setSlots((schedules.slots as any) || []);
    }
  }, [schedules]);

  // useEffect(() => {
  //   if (filteredBookings) {
  //     console.log(filteredBookings);
  //   }
  // }, [filteredBookings]);

  // Simple and reliable slot selection logic
  const handleSlotClick = useCallback(
    (
      slotId: string,
      slotIndex: number,
      slots: any[],
      fieldOnChange: (value: string[]) => void,
    ) => {
      const currentSlots = form.getValues("slots") ?? [];
      const isSelected = currentSlots.includes(slotId);

      if (selectionMode === "none") {
        // Single click - toggle slot
        const newSlots = isSelected
          ? currentSlots.filter((id) => id !== slotId)
          : [...currentSlots, slotId];

        form.setValue("slots", newSlots);
        fieldOnChange(newSlots);
      } else if (selectionMode === "range") {
        // Complete range selection
        if (rangeStart !== null) {
          // If clicking the same slot, just toggle it
          if (rangeStart === slotIndex) {
            const newSlots = isSelected
              ? currentSlots.filter((id) => id !== slotId)
              : [...currentSlots, slotId];

            form.setValue("slots", newSlots);
            fieldOnChange(newSlots);
          } else {
            // Range selection
            const start = Math.min(rangeStart, slotIndex);
            const end = Math.max(rangeStart, slotIndex);
            const slotsInRange = slots
              .slice(start, end + 1)
              .map((slot) => String(slot.id));

            // Determine if we're adding or removing based on first slot
            const firstSlotId = String(slots[rangeStart].id);
            const firstSlotSelected = currentSlots.includes(firstSlotId);

            let newSlots;
            if (firstSlotSelected) {
              // Remove all slots in range
              newSlots = currentSlots.filter(
                (id) => !slotsInRange.includes(id),
              );
            } else {
              // Add all slots in range
              newSlots = [...new Set([...currentSlots, ...slotsInRange])];
            }

            form.setValue("slots", newSlots);
            fieldOnChange(newSlots);
          }
        }

        // Reset selection mode
        setSelectionMode("none");
        setRangeStart(null);
        setHoveredIndex(null);
      }
    },
    [selectionMode, rangeStart, form],
  );

  // Handle range selection start (shift+click)
  const handleRangeStart = useCallback((slotId: string, slotIndex: number) => {
    setSelectionMode("range");
    setRangeStart(slotIndex);
    setHoveredIndex(slotIndex); // Set initial hover to the clicked slot
  }, []);

  // Handle mouse hover during range selection
  const handleSlotHover = useCallback(
    (slotIndex: number) => {
      if (selectionMode === "range") {
        setHoveredIndex(slotIndex);
      }
    },
    [selectionMode],
  );

  // Handle mouse leave - cancel range selection
  const handleMouseLeave = useCallback(() => {
    if (selectionMode === "range") {
      setSelectionMode("none");
      setRangeStart(null);
      setHoveredIndex(null);
    }
  }, [selectionMode]);

  // Check if slot is in current range preview
  const isSlotInRange = useCallback(
    (slotIndex: number) => {
      if (selectionMode !== "range" || rangeStart === null) return false;

      // If no hover yet, only show the start slot
      if (hoveredIndex === null) {
        return slotIndex === rangeStart;
      }

      const start = Math.min(rangeStart, hoveredIndex);
      const end = Math.max(rangeStart, hoveredIndex);

      return slotIndex >= start && slotIndex <= end;
    },
    [selectionMode, rangeStart, hoveredIndex],
  );

  const onSubmit = (_values: TEventFormData) => {
    console.log("Submitting");
    console.log(_values);

    // if(loadingSlots) return

    // const currentFacility = allFacilities?.find((f) => f.id === Number(_values.room));
    // // TO DO: Create use-add-event hook
    // const [room, schedule] = [currentFacility?.id.toString(), currentFacility?.schedule.toString()];

    // const startSlotId = _values.slots?.[0] ?? ""
    // const endSlotId = _values.slots?.[ _values.slots.length -1 ] ?? ""

    // const slots = allSlots?.[String(_values.room)] ?? []

    // const startSlot = slots?.find((s) => s.id === +startSlotId) ?? ""
    // const endSlot = slots?.find((s) => s.id === +endSlotId) ?? ""

    // console.log(startSlot, endSlot)

    // createBooking({
    //   slots: _values.slots?.map((s) => Number(s)) ?? [],
    //   date: _values.date.toISOString(),
    //   facility: Number(room),
    //   schedule: Number(schedule),
    //   startsAt: startSlot?.start ?? "",
    //   endsAt: endSlot?.end ?? ""
    // });
    // form.reset();
    // onClose();
  };

  // useEffect(() => {
  //   // Only reset the date, preserve other form values
  //   form.setValue("date", dayjs(currentDate) ?? dayjs());
  // }, [currentDate, form]);

  // Reset form when dialog opens/closes
  // useEffect(() => {
  //   if (isOpen) {
  //     // Reset form when dialog opens
  //     form.reset({
  //       location: "",
  //       building: "",
  //       room: "",
  //       slots: [],
  //       date: dayjs(currentDate) ?? dayjs(),
  //     });
  //     // Reset local state
  //     setLocation("");
  //     setBuilding(0);
  //     setAmenities([]);
  //     setSelectionMode("none");
  //     setRangeStart(null);
  //     setHoveredIndex(null);
  //   }
  // }, [isOpen, form, currentDate]);

  return (
    <div>
      <Form {...form}>
        <form
          id="event-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid gap-4 py-4"
        >
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <FormControl>
                  <MiniCalendar
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <MiniCalendarNavigation direction="prev" />
                    <MiniCalendarDays className="flex w-full justify-between">
                      {(date) => (
                        <MiniCalendarDay date={date} key={date.toISOString()} />
                      )}
                    </MiniCalendarDays>
                    <MiniCalendarNavigation direction="next" />
                  </MiniCalendar>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="email" {...field} />
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
                  <Input type="text" placeholder="name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input type="tel" placeholder="phone" {...field} />
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
                  <Input type="text" placeholder="title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Combobox
                    data={(locations || []).map((l: any) => ({
                      label: l.name,
                      value: l.name,
                    }))}
                    open={locationOpen}
                    onOpenChange={(open) => setLocationOpen(open)}
                    type="location"
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <ComboboxTrigger className="w-full" />
                    <ComboboxContent className="w-full">
                      <ComboboxInput />
                      <ComboboxEmpty />
                      <ComboboxList>
                        <ComboboxGroup className="w-full">
                          {locations?.map((location) => (
                            <ComboboxItem
                              className="w-full"
                              key={location.name}
                              value={location.name}
                            >
                              {/* {location.name} */}
                              <span className="flex flex-col items-start gap-px">
                                <span className="font-medium">
                                  {location.name}
                                </span>
                                <small className="text-muted-foreground text-xs">
                                  {location.address}
                                </small>
                              </span>
                            </ComboboxItem>
                          ))}
                        </ComboboxGroup>
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="building"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Building</FormLabel>
                <FormControl>
                  {/* <Select
                    value={String(field.value || "")}
                    onValueChange={(value) => {
                      setBuilding(+value);
                      form.setValue("room", ""); // Reset room when building changes
                      field.onChange(value);
                    }}
                    disabled={!location}
                    indicator={
                      <SelectIndicator>
                        <RiCheckboxCircleFill className="text-primary size-4" />
                      </SelectIndicator>
                    }
                  >
                    <SelectTrigger className="w-full border border-gray-100 [&_small]:hidden">
                      <SelectValue
                        placeholder={
                          location ? "Select building" : "Select location first"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {buildings
                        ?.filter(
                          (localBuildings) =>
                            localBuildings.location === location,
                        )
                        ?.map((building: any) => (
                          <SelectItem
                            key={building.id}
                            value={building.id.toString()}
                          >
                            <span className="flex flex-col items-start gap-px">
                              <span className="font-medium">
                                {building.name}
                              </span>
                              <small className="text-muted-foreground text-xs">
                                {building.location}
                              </small>
                            </span>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select> */}
                  <Combobox
                    data={(buildings || []).map((b: any) => ({
                      label: b.name,
                      value: b.id.toString(),
                    }))}
                    open={buildingOpen}
                    onOpenChange={(open) => setBuildingOpen(open)}
                    type="building"
                    value={String(field.value || "")}
                    onValueChange={(val) => field.onChange(Number(val) || 0)}
                  >
                    <ComboboxTrigger className="w-full" />
                    <ComboboxContent className="w-full">
                      <ComboboxInput />
                      <ComboboxEmpty>
                        {location === ""
                          ? "Select a location first"
                          : isLoadingBuildings
                            ? "Fetching buildings..."
                            : "No buildings found"}
                      </ComboboxEmpty>
                      <ComboboxList>
                        <ComboboxGroup className="w-full">
                          {buildings?.map((building) => (
                            <ComboboxItem
                              className="w-full"
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
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="room"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Room/Facility</FormLabel>
                <FormControl>
                  {/* <Select
                    value={String(field.value || "")}
                    onValueChange={(value) => {
                      field.onChange(value);
                      const room = facilities?.find((val) => val.id == value);
                      setAmenities(room.amenities);
                    }}
                    disabled={!building}
                    indicator={
                      <SelectIndicator>
                        <RiCheckboxCircleFill className="text-primary size-4" />
                      </SelectIndicator>
                    }
                  >
                    <SelectTrigger className="w-full border border-gray-100 [&_small]:hidden">
                      <SelectValue
                        placeholder={
                          building
                            ? "Select room/facility"
                            : "Select building first"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {facilities
                        ?.filter(
                          (localFacility) =>
                            localFacility.building.id.toString() === building,
                        )
                        ?.map((facility: any) => (
                          <SelectItem
                            key={facility.id}
                            value={facility.id.toString()}
                          >
                            <div className="flex w-full flex-col items-start gap-1">
                              <span className="font-medium">
                                {facility.name}
                              </span>
                              <div className="flex flex-col gap-0.5">
                                <small className="text-muted-foreground text-xs">
                                  Capacity: {facility.capacity}
                                </small>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select> */}
                  <Combobox
                    data={(facilities || []).map((f: any) => ({
                      label: f.name,
                      value: f.id.toString(),
                    }))}
                    open={facilityOpen}
                    onOpenChange={(open) => setFacilityOpen(open)}
                    type="facility"
                    value={String(field.value || "")}
                    onValueChange={(val) => {
                        const facility = facilities?.find(
                          (f) => f.id === numeral(val).value(),
                        );
                        setSchedule(facility?.schedule || 0);
                        field.onChange(val)
                        if(schedules){
                          setSlots(schedules.slots)
                        }
                    }}
                  >
                    <ComboboxTrigger className="w-full" />
                    <ComboboxContent className="w-full">
                      <ComboboxInput />
                      <ComboboxEmpty />
                      <ComboboxList>
                        <ComboboxGroup className="w-full">
                          {facilities?.map((facility) => (
                            <ComboboxItem
                              className="w-full"
                              key={facility.id.toString()}
                              value={facility.id.toString()}
                            >
                              <div className="flex w-full flex-col items-start gap-1">
                                <span className="font-medium">
                                  {facility.name}
                                </span>
                                <div className="flex flex-col gap-0.5">
                                  <small className="text-muted-foreground text-xs">
                                    Capacity: {facility.capacity}
                                  </small>
                                </div>
                              </div>
                            </ComboboxItem>
                          ))}
                        </ComboboxGroup>
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                </FormControl>
                <FormDescription>
                  {amenities && amenities.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {amenities.map((amenity: any, index: number) => (
                        <span
                          key={index}
                          className="bg-primary/10 text-primary border-primary/20 inline-flex items-center rounded border px-1.5 py-0.5 text-xs"
                        >
                          {amenity.name || amenity}
                        </span>
                      ))}
                    </div>
                  )}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="slots"
            render={({ field }) => {
              const currentSlots =
                slots ?? [];

              const selectedSlots = field.value ?? [];

              return (
                <FormItem className="space-y-3">
                  <FormLabel>Time Slots</FormLabel>
                  <FormDescription>
                    {selectionMode === "range"
                      ? `Range selection active. Click another slot to complete (${rangeStart !== null ? `from slot ${rangeStart + 1}` : ""}), or move mouse away to cancel.`
                      : "Click to select individual slots. Hold Shift and click to start range selection."}
                  </FormDescription>

                  <FormControl>
                    <div
                      ref={slotsContainerRef}
                      className={`max-h-60 overflow-y-auto rounded-md border p-2 transition-colors ${
                        selectionMode === "range"
                          ? "border-primary/50 bg-primary/5"
                          : "border-gray-200 bg-white"
                      }`}
                      onMouseLeave={handleMouseLeave}
                    >
                      {currentSlots.length > 0 ? (
                        <div className="grid grid-cols-1 gap-1">
                          {currentSlots.map((slot, index) => {
                            const value = String(slot?.id);
                            const isSelected = selectedSlots.includes(value);
                            const isInRange = isSlotInRange(index);
                            const isRangeStart =
                              selectionMode === "range" && rangeStart === index;
                            const isRangeEnd =
                              selectionMode === "range" &&
                              hoveredIndex === index &&
                              hoveredIndex !== rangeStart;

                            return (
                              <div
                                key={value}
                                className={`relative flex cursor-pointer items-center justify-between rounded-md border-2 p-3 transition-all duration-150 ${
                                  isSelected
                                    ? "border-primary bg-primary/10 text-primary"
                                    : isInRange
                                      ? "border-primary/50 bg-primary/5 text-primary/80"
                                      : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                                } ${isRangeStart ? "rounded-t-md" : ""} ${isRangeEnd ? "rounded-b-md" : ""} ${isInRange && !isRangeStart && !isRangeEnd ? "rounded-none" : ""} `}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();

                                  if (e.shiftKey) {
                                    // Shift+click to start range selection
                                    handleRangeStart(value, index);
                                  } else {
                                    // Normal click
                                    handleSlotClick(
                                      value,
                                      index,
                                      currentSlots,
                                      field.onChange,
                                    );
                                  }
                                }}
                                onMouseEnter={() => handleSlotHover(index)}
                              >
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`h-4 w-4 rounded-full border-2 transition-all ${
                                      isSelected
                                        ? "border-primary bg-primary"
                                        : isInRange
                                          ? "border-primary/50 bg-primary/20"
                                          : "border-gray-300 bg-white"
                                    } `}
                                  >
                                    {isSelected && (
                                      <div className="h-full w-full scale-50 rounded-full bg-white" />
                                    )}
                                  </div>
                                  <span className="text-sm font-medium">
                                    {slot.start} - {slot.end}
                                  </span>
                                </div>

                                {isInRange && (
                                  <div className="text-primary/60 text-xs font-medium">
                                    {isRangeStart
                                      ? "Start"
                                      : isRangeEnd
                                        ? "End"
                                        : "Range"}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center py-8">
                          <p className="text-sm text-gray-500">
                            Please select a room to see available time slots.
                          </p>
                        </div>
                      )}
                    </div>
                  </FormControl>

                  {selectedSlots.length > 0 && (
                    <div className="rounded-md bg-green-50 p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-green-800">
                            Selected {selectedSlots.length} slot
                            {selectedSlots.length !== 1 ? "s" : ""}
                          </p>
                          <p className="mt-1 text-xs text-green-600">
                            {(() => {
                              const currentSlots =
                                slots ??
                                [];
                              const selectedSlotObjects = currentSlots.filter(
                                (slot) =>
                                  selectedSlots.includes(String(slot.id)),
                              );

                              if (selectedSlotObjects.length === 0)
                                return "No slots found";

                              // Sort by slot order (assuming slots are in chronological order)
                              const sortedSlots = selectedSlotObjects.sort(
                                (a, b) => {
                                  const aIndex = currentSlots.findIndex(
                                    (s) => s.id === a.id,
                                  );
                                  const bIndex = currentSlots.findIndex(
                                    (s) => s.id === b.id,
                                  );
                                  return aIndex - bIndex;
                                },
                              );

                              const firstSlot = sortedSlots[0];
                              const lastSlot =
                                sortedSlots[sortedSlots.length - 1];

                              // Check if slots are consecutive
                              const isConsecutive =
                                sortedSlots.length > 1 &&
                                sortedSlots.every((slot, index) => {
                                  if (index === 0) return true;
                                  const prevSlot = sortedSlots[index - 1];
                                  const prevIndex = currentSlots.findIndex(
                                    (s) => s.id === prevSlot.id,
                                  );
                                  const currentIndex = currentSlots.findIndex(
                                    (s) => s.id === slot.id,
                                  );
                                  return currentIndex === prevIndex + 1;
                                });

                              if (selectedSlots.length === 1) {
                                return `${firstSlot.start} - ${firstSlot.end}`;
                              } else if (isConsecutive) {
                                return `${firstSlot.start} to ${lastSlot.end}`;
                              } else {
                                // Show individual slots for non-consecutive selection
                                return sortedSlots
                                  .map((slot) => `${slot.start}-${slot.end}`)
                                  .join(", ");
                              }
                            })()}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            form.setValue("slots", []);
                            field.onChange([]);
                          }}
                          className="ml-3 border-green-300 text-green-700 hover:bg-green-100"
                        >
                          Clear
                        </Button>
                      </div>
                    </div>
                  )}

                  <FormMessage />
                </FormItem>
              );
            }}
          />

          <Button type="button" className="cursor-pointer" variant="outline">
            Cancel
          </Button>
          <Button form="event-form" className="cursor-pointer" type="submit">
            Confirm
          </Button>
        </form>
      </Form>
    </div>
  );
}
