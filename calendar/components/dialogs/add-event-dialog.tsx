"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";

import {
  Select,
  SelectContent,
  SelectIndicator,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RiCheckboxCircleFill } from "@remixicon/react";

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
  Dialog,
  DialogHeader,
  DialogClose,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import { eventSchema } from "@/calendar/schemas";

import type { TEventFormData } from "@/calendar/schemas";
import { api } from "@/trpc/react";
import { toast } from "sonner";

// import { useEffect } from "react";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useDisclosure } from "@/hooks/use-disclosure";
// import { useCalendar } from "@/calendar/contexts/calendar-context";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Textarea } from "@/components/ui/textarea";
// import { TimeInput } from "@/components/ui/time-input";
// import { SingleDayPicker } from "@/components/ui/single-day-picker";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Form, FormField, FormLabel, FormItem, FormControl, FormMessage } from "@/components/ui/form";
// import { Select, SelectItem, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Dialog, DialogHeader, DialogClose, DialogContent, DialogTrigger, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
// import { eventSchema } from "@/calendar/schemas";
// import type { TimeValue } from "react-aria-components";
// import type { TEventFormData } from "@/calendar/schemas";

interface IProps {
  children: React.ReactNode;
  date?: Date;
  location: string | number;
  building: string | number;
  room: string | number;
}

export function AddEventDialog({ children, date }: IProps) {
  const { isOpen, onToggle } = useDisclosure();
  const [building, setBuilding] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [amenities, setAmenities] = useState<any[]>([]);
  
  // Slot selection state - simplified approach
  const [selectionMode, setSelectionMode] = useState<'none' | 'single' | 'range'>('none');
  const [rangeStart, setRangeStart] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const slotsContainerRef = useRef<HTMLDivElement>(null);

  const { data: allLocations } = api.location.list.useQuery();
  const { data: allBuildings } = api.building.list.useQuery();

  const { data: allSlots, isLoading: loadingSlots } = api.slots.getAll.useQuery();
  const { data: allFacilities } = api.facility.getAll.useQuery();

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

  const form = useForm<TEventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      location: "",
      building: "",
      room: "",
      slots: [],
      date: dayjs(date ?? undefined),
    },
  });

  // Simple and reliable slot selection logic
  const handleSlotClick = useCallback((slotId: string, slotIndex: number, slots: any[], fieldOnChange: (value: string[]) => void) => {
    const currentSlots = form.getValues("slots") ?? [];
    const isSelected = currentSlots.includes(slotId);

    if (selectionMode === 'none') {
      // Single click - toggle slot
      const newSlots = isSelected 
        ? currentSlots.filter(id => id !== slotId)
        : [...currentSlots, slotId];
      
      form.setValue("slots", newSlots);
      fieldOnChange(newSlots);
    } else if (selectionMode === 'range') {
      // Complete range selection
      if (rangeStart !== null) {
        // If clicking the same slot, just toggle it
        if (rangeStart === slotIndex) {
          const newSlots = isSelected 
            ? currentSlots.filter(id => id !== slotId)
            : [...currentSlots, slotId];
          
          form.setValue("slots", newSlots);
          fieldOnChange(newSlots);
        } else {
          // Range selection
          const start = Math.min(rangeStart, slotIndex);
          const end = Math.max(rangeStart, slotIndex);
          const slotsInRange = slots.slice(start, end + 1).map(slot => String(slot.id));
          
          // Determine if we're adding or removing based on first slot
          const firstSlotId = String(slots[rangeStart].id);
          const firstSlotSelected = currentSlots.includes(firstSlotId);
          
          let newSlots;
          if (firstSlotSelected) {
            // Remove all slots in range
            newSlots = currentSlots.filter(id => !slotsInRange.includes(id));
          } else {
            // Add all slots in range
            newSlots = [...new Set([...currentSlots, ...slotsInRange])];
          }
          
          form.setValue("slots", newSlots);
          fieldOnChange(newSlots);
        }
      }
      
      // Reset selection mode
      setSelectionMode('none');
      setRangeStart(null);
      setHoveredIndex(null);
    }
  }, [selectionMode, rangeStart, form]);

  // Handle range selection start (shift+click)
  const handleRangeStart = useCallback((slotId: string, slotIndex: number) => {
    setSelectionMode('range');
    setRangeStart(slotIndex);
    setHoveredIndex(slotIndex); // Set initial hover to the clicked slot
  }, []);

  // Handle mouse hover during range selection
  const handleSlotHover = useCallback((slotIndex: number) => {
    if (selectionMode === 'range') {
      setHoveredIndex(slotIndex);
    }
  }, [selectionMode]);

  // Handle mouse leave - cancel range selection
  const handleMouseLeave = useCallback(() => {
    if (selectionMode === 'range') {
      setSelectionMode('none');
      setRangeStart(null);
      setHoveredIndex(null);
    }
  }, [selectionMode]);

  // Check if slot is in current range preview
  const isSlotInRange = useCallback((slotIndex: number) => {
    if (selectionMode !== 'range' || rangeStart === null) return false;
    
    // If no hover yet, only show the start slot
    if (hoveredIndex === null) {
      return slotIndex === rangeStart;
    }
    
    const start = Math.min(rangeStart, hoveredIndex);
    const end = Math.max(rangeStart, hoveredIndex);
    
    return slotIndex >= start && slotIndex <= end;
  }, [selectionMode, rangeStart, hoveredIndex]);

  const onSubmit = (_values: TEventFormData) => {

    if(loadingSlots) return


    const currentFacility = allFacilities?.find((f) => f.id === Number(_values.room));
    // TO DO: Create use-add-event hook
    const [room, schedule] = [currentFacility?.id.toString(), currentFacility?.schedule.toString()];

    const startSlotId = _values.slots?.[0] ?? ""
    const endSlotId = _values.slots?.[ _values.slots.length -1 ] ?? ""

    const slots = allSlots?.[String(_values.room)] ?? []

    const startSlot = slots?.find((s) => s.id === +startSlotId) ?? ""
    const endSlot = slots?.find((s) => s.id === +endSlotId) ?? ""

    console.log(startSlot, endSlot)

    createBooking({
      slots: _values.slots?.map((s) => Number(s)) ?? [],
      date: _values.date.toISOString(),
      facility: Number(room),
      schedule: Number(schedule),
      startsAt: startSlot?.start ?? "",
      endsAt: endSlot?.end ?? ""
    });
    form.reset();
    onClose();
  };

  useEffect(() => {
    // Only reset the date, preserve other form values
    form.setValue("date", dayjs(date) ?? dayjs());
  }, [date, form]);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      // Reset form when dialog opens
      form.reset({
        location: "",
        building: "",
        room: "",
        slots: [],
        date: dayjs(date) ?? dayjs(),
      });
      // Reset local state
      setLocation("");
      setBuilding("");
      setAmenities([]);
      setSelectionMode('none');
      setRangeStart(null);
      setHoveredIndex(null);
    }
  }, [isOpen, form, date]);

  return (
    <Dialog open={isOpen} onOpenChange={onToggle}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Booking</DialogTitle>
          <DialogDescription>
            {/* This is just and example of how to use the form. In a real
            application, you would call the API to create the booking */}
          </DialogDescription>
        </DialogHeader>
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
                   <MiniCalendar  onValueChange={field.onChange} value={field.value}>
                      <MiniCalendarNavigation direction="prev" />
                      <MiniCalendarDays className="w-full flex justify-between">
                        {(date) => 
                          <MiniCalendarDay
                            date={date} 
                            key={date.toISOString()} 
                          />
                        }
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
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Select
                      value={String(field.value || "")}
                      onValueChange={(value) => {
                        setLocation(value);
                        setBuilding(""); // Reset building when location changes
                        form.setValue("building", "");
                        form.setValue("room", "");
                        field.onChange(value);
                      }}
                      indicator={
                        <SelectIndicator>
                          <RiCheckboxCircleFill className="text-primary size-4" />
                        </SelectIndicator>
                      }
                    >
                      <SelectTrigger className="w-full border border-gray-100 [&_small]:hidden">
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        {allLocations?.map((location: any) => (
                          <SelectItem key={location.id} value={location.name}>
                            <span className="flex flex-col items-start gap-px">
                              <span className="font-medium">
                                {location.name}
                              </span>
                              <small className="text-muted-foreground text-xs">
                                {location.address}
                              </small>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                    <Select
                      value={String(field.value || "")}
                      onValueChange={(value) => {
                        setBuilding(value);
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
                            location
                              ? "Select building"
                              : "Select location first"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {allBuildings
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
                    </Select>
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
                    <Select
                      value={String(field.value || "")}
                      onValueChange={(value) => {
                        field.onChange(value);
                        const room = allFacilities?.find(
                          (val) => val.id == value,
                        );
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
                        {allFacilities
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
                    </Select>
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
                const currentSlots = allSlots?.[String(form.getValues("room"))] ?? [];
                const selectedSlots = field.value ?? [];
                
                return (
                  <FormItem className="space-y-3">
                    <FormLabel>Time Slots</FormLabel>
                    <FormDescription>
                      {selectionMode === 'range' 
                        ? `Range selection active. Click another slot to complete (${rangeStart !== null ? `from slot ${rangeStart + 1}` : ''}), or move mouse away to cancel.`
                        : "Click to select individual slots. Hold Shift and click to start range selection."
                      }
                    </FormDescription>

                    <FormControl>
                      <div 
                        ref={slotsContainerRef}
                        className={`max-h-60 overflow-y-auto rounded-md border p-2 transition-colors ${
                          selectionMode === 'range' 
                            ? 'border-primary/50 bg-primary/5' 
                            : 'border-gray-200 bg-white'
                        }`}
                        onMouseLeave={handleMouseLeave}
                      >
                        {currentSlots.length > 0 ? (
                          <div className="grid grid-cols-1 gap-1">
                            {currentSlots.map((slot, index) => {
                              const value = String(slot?.id);
                              const isSelected = selectedSlots.includes(value);
                              const isInRange = isSlotInRange(index);
                              const isRangeStart = selectionMode === 'range' && rangeStart === index;
                              const isRangeEnd = selectionMode === 'range' && hoveredIndex === index && hoveredIndex !== rangeStart;
                              
                              return (
                                <div
                                  key={value}
                                  className={`
                                    relative flex cursor-pointer items-center justify-between rounded-md border-2 p-3 transition-all duration-150
                                    ${isSelected 
                                      ? 'border-primary bg-primary/10 text-primary' 
                                      : isInRange 
                                        ? 'border-primary/50 bg-primary/5 text-primary/80' 
                                        : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                                    }
                                    ${isRangeStart ? 'rounded-t-md' : ''}
                                    ${isRangeEnd ? 'rounded-b-md' : ''}
                                    ${isInRange && !isRangeStart && !isRangeEnd ? 'rounded-none' : ''}
                                  `}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    
                                    if (e.shiftKey) {
                                      // Shift+click to start range selection
                                      handleRangeStart(value, index);
                                    } else {
                                      // Normal click
                                      handleSlotClick(value, index, currentSlots, field.onChange);
                                    }
                                  }}
                                  onMouseEnter={() => handleSlotHover(index)}
                                >
                                  <div className="flex items-center gap-3">
                                    <div className={`
                                      h-4 w-4 rounded-full border-2 transition-all
                                      ${isSelected 
                                        ? 'border-primary bg-primary' 
                                        : isInRange 
                                          ? 'border-primary/50 bg-primary/20' 
                                          : 'border-gray-300 bg-white'
                                      }
                                    `}>
                                      {isSelected && (
                                        <div className="h-full w-full rounded-full bg-white scale-50" />
                                      )}
                                    </div>
                                    <span className="font-medium text-sm">
                                      {slot.start} - {slot.end}
                                    </span>
                                  </div>
                                  
                                  {isInRange && (
                                    <div className="text-xs text-primary/60 font-medium">
                                      {isRangeStart ? 'Start' : isRangeEnd ? 'End' : 'Range'}
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
                              Selected {selectedSlots.length} slot{selectedSlots.length !== 1 ? 's' : ''}
                            </p>
                            <p className="text-xs text-green-600 mt-1">
                              {(() => {
                                const currentSlots = allSlots?.[String(form.getValues("room"))] ?? [];
                                const selectedSlotObjects = currentSlots.filter(slot => 
                                  selectedSlots.includes(String(slot.id))
                                );
                                
                                if (selectedSlotObjects.length === 0) return 'No slots found';
                                
                                // Sort by slot order (assuming slots are in chronological order)
                                const sortedSlots = selectedSlotObjects.sort((a, b) => {
                                  const aIndex = currentSlots.findIndex(s => s.id === a.id);
                                  const bIndex = currentSlots.findIndex(s => s.id === b.id);
                                  return aIndex - bIndex;
                                });
                                
                                const firstSlot = sortedSlots[0];
                                const lastSlot = sortedSlots[sortedSlots.length - 1];
                                
                                // Check if slots are consecutive
                                const isConsecutive = sortedSlots.length > 1 && 
                                  sortedSlots.every((slot, index) => {
                                    if (index === 0) return true;
                                    const prevSlot = sortedSlots[index - 1];
                                    const prevIndex = currentSlots.findIndex(s => s.id === prevSlot.id);
                                    const currentIndex = currentSlots.findIndex(s => s.id === slot.id);
                                    return currentIndex === prevIndex + 1;
                                  });
                                
                                if (selectedSlots.length === 1) {
                                  return `${firstSlot.start} - ${firstSlot.end}`;
                                } else if (isConsecutive) {
                                  return `${firstSlot.start} to ${lastSlot.end}`;
                                } else {
                                  // Show individual slots for non-consecutive selection
                                  return sortedSlots.map(slot => `${slot.start}-${slot.end}`).join(', ');
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
                            className="text-green-700 border-green-300 hover:bg-green-100 ml-3"
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

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" className="cursor-pointer" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button form="event-form" className="cursor-pointer" type="submit">
                Confirm
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
