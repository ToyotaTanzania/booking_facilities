"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";

import { useDisclosure } from "@/hooks/use-disclosure";
import { useCalendar } from "@/calendar/contexts/calendar-context";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormLabel,
  FormItem,
  FormControl,
  FormMessage,
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

import { Input, type TimeValue } from "react-aria-components";
import type { TEventFormData } from "@/calendar/schemas";
import { api } from "@/trpc/react";
import { bookingFiltersAtom } from "@/store/booking";
import { useAtom } from "jotai/react";
import { DatePicker } from "@/components/ui/date-picker";
import { format, isValid, parse } from "date-fns";
import { useId } from "react";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { fi, id } from "date-fns/locale";
import _, { create, set } from "lodash";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useMount } from "react-use";
import { SingleDayPicker } from "@/components/ui/single-day-picker";
import { Textarea } from "@/components/ui/textarea";
import { TimeInput } from "@/components/ui/time-input";
import { Avatar, AvatarImage, AvatarFallback } from "@radix-ui/react-avatar";

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
  startDate?: Date;
  startTime?: { hour: number; minute: number };
}

export function AddEventDialog({ children, startDate }: IProps) {
  const session = useSession();

  const [schedule, setSchedule] = useState<string>("");

  const { isOpen, onClose, onToggle } = useDisclosure();
  const { data: allSlots } = api.slots.getAll.useQuery();
  const { data: allFacilities } = api.facility.getAll.useQuery();

  const utils = api.useUtils();

  const { data: bookings, isLoading: bookingsLoading } =
    api.booking.getCalendarBookings.useQuery();

  const { mutate: createBooking } = api.booking.create.useMutation({
    onSuccess: async () => {
      toast.success("Booking created successfully");
      await utils.booking.getCalendarBookings.invalidate();
    },
    onError: () => {
      toast.error("Failed to create booking");
    },
  });

  // const { data: booked, isLoading } = api.facility.getAllByDate.useQuery({
  //   date: date ? new Date(date) : new Date(),
  //   facility: facility?.id ?? null,
  //   building: building?.id ?? null,
  //   location: location?.id   ?? null,
  // },{
  //   enabled: !!date,
  //   refetchOnMount: true,
  //   refetchOnWindowFocus: true,
  //   refetchOnReconnect: true,
  //   refetchInterval: 1000 * 60 * 5,
  //   refetchIntervalInBackground: true,
  // })

  const facilities = _.groupBy(
    allFacilities,
    (fac: { building: { name: string; location: string } }) =>
      fac.building.name + "," + fac.building.location,
  );

  const form = useForm<TEventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      room: "",
      slots: [],
      date: startDate ? new Date(startDate) : new Date(),
    },
  });

  const onSubmit = (_values: TEventFormData) => {
    // TO DO: Create use-add-event hook
    const [room, schedule] = (_values.room ?? "").split(",");
    createBooking({
      slots: _values.slots?.map((s) => Number(s)) ?? [],
      date: _values.date.toISOString(),
      facility: Number(room),
      schedule: Number(schedule),
    });
    form.reset();
    onClose();
  };

  useEffect(() => {
    form.reset({
      date: startDate ? new Date(startDate) : new Date(),
    });
  }, [startDate, form]);

  useMount(() => {
   
  });

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
                  <FormLabel htmlFor="date">Date</FormLabel>

                  <FormControl className="w-full">
                    <DatePicker onChange={field.onChange} value={field.value} />
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
                  <FormLabel htmlFor="Location">Room</FormLabel>

                  <Select
                    onValueChange={(value: string) => {
                      field.onChange(value);

                      setSchedule(value.split(",")[1] ?? "");

                      form.setValue("slots", []);
                    }}
                    value={field.value}
                  >
                    <SelectTrigger className="w-full **:data-desc:hidden">
                      <SelectValue placeholder="Choose a plan" />
                    </SelectTrigger>

                    <SelectContent className="[&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2">
                      {_.filter(facilities, (f) => f.length > 0).map(
                        (group, index) => (
                          <div key={index}>
                            <div className="text-muted-foreground px-2 py-1 text-sm font-medium">
                              {_.startCase(group[0].building.name)},{" "}
                              {_.startCase(group[0].building.location)}
                            </div>

                            {group.map((facility) => (
                              <SelectItem
                                key={facility.id.toString() + index}
                                value={`${facility.id.toString()},${facility.schedule}`}
                                onSelect={field.onChange}
                                className="cursor-pointer"
                              >
                                {_.startCase(facility.name)}{" "}
                                <span
                                  className="text-muted-foreground mt-1 block text-xs"
                                  data-desc
                                >
                                  Capacity: {facility.capacity}
                                </span>
                              </SelectItem>
                            ))}
                          </div>
                        ),
                      )}
                    </SelectContent>
                  </Select>

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
                      {schedule && allSlots?.[schedule]?.length ? (
                        allSlots[schedule].map((slot) => {
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
