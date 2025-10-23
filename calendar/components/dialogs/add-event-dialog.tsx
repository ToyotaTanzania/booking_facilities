"use client";

import { useEffect, useState } from "react";
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
import { Label } from "@/components/ui/label";
import _ from "lodash";
import { Checkbox } from "@/components/ui/checkbox";
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
  const [amenities, setAmenities] = useState();

  const { data: allLocations } = api.location.list.useQuery();
  const { data: allBuildings } = api.building.list.useQuery();

  const { data: allSlots } = api.slots.getAll.useQuery();
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
      date: dayjs(date || undefined),
    },
  });

  const onSubmit = (_values: TEventFormData) => {
    console.log(_values);
    // TO DO: Create use-add-event hook
    // const [room, schedule] = (_values.room ?? "").split(",");
    // createBooking({
    //   slots: _values.slots?.map((s) => Number(s)) ?? [],
    //   date: _values.date.toISOString(),
    //   facility: Number(room),
    //   schedule: Number(schedule),
    // });
    // form.reset();
    // onClose();
  };

  useEffect(() => {
    form.reset({
      date: dayjs(date) ?? dayjs(),
    });
  }, [date, form]);

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
                  <FormDescription>
                    Selected: {field.value || "None"}
                  </FormDescription>
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
                  <FormDescription>
                    Selected: {field.value || "None"}
                  </FormDescription>
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
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Time Slots</FormLabel>

                  <FormControl>
                    <div className="grid max-h-60 grid-cols-2 gap-2 overflow-y-auto rounded-md bg-gray-100 p-4">
                      {form.getValues("room") &&
                      allSlots?.[String(form.getValues("room"))]?.length ? (
                        allSlots[String(form.getValues("room"))].map((slot) => {
                          const value = String(slot?.id);
                          const inputId = `slot-${value}`;
                          const isChecked =
                            Array.isArray(field.value) &&
                            field.value.includes(value);
                          return (
                            <div
                              className="flex cursor-pointer items-center gap-2 rounded-sm p-2"
                              key={value}
                            >
                              <Checkbox
                                id={inputId}
                                className="cursor-pointer border-black"
                                checked={isChecked}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    field.onChange([
                                      ...(field.value ?? []),
                                      value,
                                    ]);
                                  } else {
                                    field.onChange(
                                      (field.value ?? []).filter(
                                        (v: string) => v !== value,
                                      ),
                                    );
                                  }
                                }}
                              />
                              <Label htmlFor={inputId}>
                                {slot.start} - {slot.end}{" "}
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

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button form="event-form" type="submit">
                Confirm
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
