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

import type { TimeValue } from "react-aria-components";
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

interface IProps {
  children: React.ReactNode;
  startDate?: Date;
  startTime?: { hour: number; minute: number };
}

export function AddEventDialog({ children, startDate }: IProps) {
  const session = useSession();
  const [schedule, setSchedule] = useState<string>("");
  const { users, events, setLocalEvents } = useCalendar();
  
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
    console.log(_values);
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
  console.log("Mounting")
  console.log(session);
  console.log("End mounting");
});

  return (
    <>
        { 
          session.status === "authenticated" 

        }
    </>
  );
}
