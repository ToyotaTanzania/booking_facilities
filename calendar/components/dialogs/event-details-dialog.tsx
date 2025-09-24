"use client";

import { parseISO } from "date-fns";
import { useCalendar } from "@/calendar/contexts/calendar-context";
import { Button } from "@/components/ui/button";
import { EditEventDialog } from "@/calendar/components/dialogs/edit-event-dialog";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/ui/date-picker";
import { zodResolver } from "@hookform/resolvers/zod";
import type {
  IEvent,
  IFacility,
  ISchedule,
  ISlot,
} from "@/calendar/interfaces";
import { eventSchema, type TEventFormData } from "@/calendar/schemas";
import { useForm } from "react-hook-form";
import { api } from "@/trpc/react";
import _ from "lodash";

import {
  Form,
  FormField,
  FormLabel,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";

interface IProps {
  event: IEvent;
  children: React.ReactNode;
}

export function EventDetailsDialog({ event, children }: IProps) {
  const getId = (
    value: number | { id: number } | undefined,
  ): number | undefined => {
    if (typeof value === "number") return value;
    if (value && typeof value === "object" && "id" in value) return value.id;
    return undefined;
  };

  const scheduleId = getId(event?.schedule);
  const [schedule, setSchedule] = useState<string>(
    scheduleId ? String(scheduleId) : "",
  );
  const eventSlotId = getId(event?.slot as number | ISlot | undefined);

  const { responsibles } = useCalendar();

  const { data: allSlots } = api.slots.getAll.useQuery();
  const { data: allFacilities } = api.facility.getAll.useQuery();

  const dateValue =
    typeof event.date === "string"
      ? parseISO(event.date)
      : new Date(event.date);

  // const responsible = responsibles.find((r) => getId(r.facility) === getId(event.facility));

  const facilitiesSource: IFacility[] = (allFacilities ?? []) as IFacility[];
  const facilitiesByBuilding: Record<string, IFacility[]> = _.groupBy(
    facilitiesSource,
    (fac: IFacility) => {
      const building =
        typeof fac.building === "number" ? undefined : fac.building;
      const buildingName = building?.name ?? "Unknown";
      const buildingLocation =
        (building?.location as string | undefined) ?? "Unknown";
      return `${buildingName},${buildingLocation}`;
    },
  );

  const form = useForm<TEventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      room: `${getId(event?.facility) ?? ""},${scheduleId ?? ""}`,
      slots: eventSlotId ? [String(eventSlotId)] : [],
      date: dateValue ?? new Date(),
    },
  });

  useEffect(() => {
   const newScheduleId = getId(
      event?.schedule as number | ISchedule | undefined,
    );
    setSchedule(newScheduleId ? String(newScheduleId) : "");
    const newDate =
      typeof event.date === "string"
        ? parseISO(event.date)
        : new Date(event.date);
    const newEventSlotId = getId(event?.slot as number | ISlot | undefined);
    form.reset({
      room: `${getId(event?.facility) ?? ""},${newScheduleId ?? ""}`,
      slots: newEventSlotId ? [String(newEventSlotId)] : [],
      date: newDate ?? new Date(),
    });
  }, [event, form]);

  const onSubmit = (_values: TEventFormData) => {

  };

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>{children}</DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>Event details</DialogTitle>
          </DialogHeader>

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
                      <FormLabel htmlFor="date">Date</FormLabel>

                      <FormControl className="w-full">
                        <DatePicker
                          onChange={field.onChange}
                          value={field.value}
                        />
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
                          {Object.values(facilitiesByBuilding)
                            .filter((f) => f.length > 0)
                            .map((group, index) => {
                              const first = group?.[0];
                              const firstBuilding =
                                first && typeof first.building !== "number"
                                  ? first.building
                                  : undefined;
                              const buildingName =
                                firstBuilding?.name ?? "Unknown";
                              const buildingLocation =
                                (firstBuilding?.location as
                                  | string
                                  | undefined) ?? "Unknown";
                              return (
                                <div key={index}>
                                  <div className="text-muted-foreground px-2 py-1 text-sm font-medium">
                                    {_.startCase(buildingName)},{" "}
                                    {_.startCase(buildingLocation)}
                                  </div>

                                  {group.map((facility) => (
                                    <SelectItem
                                      key={facility.id.toString() + index}
                                      value={`${facility.id.toString()},${
                                        getId(facility.schedule) ?? ""
                                      }`}
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
                              );
                            })}
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
                          {(() => {
                            const slotsBySchedule = (allSlots ?? {}) as Record<
                              string,
                              { id: number; start: string; end: string }[]
                            >;
                            return schedule &&
                              slotsBySchedule?.[schedule]?.length ? (
                              slotsBySchedule[schedule].map((slot) => {
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
                                Please select a room to see available time
                                slots.
                              </p>
                            );
                          })()}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <div className="flex w-full justify-between">
                    <div></div>

                    <div className="flex gap-2">
                      <DialogClose asChild>
                        <Button type="button" variant="outline">
                          Cancel
                        </Button>
                      </DialogClose>
                      <Button form="event-form" type="submit">
                        Confirm
                      </Button>
                    </div>
                  </div>
                </DialogFooter>
              </form>
            </Form>
          </div>

          {/* <DialogFooter>
            <EditEventDialog event={event}>
              <Button type="button" variant="outline">
                Edit
              </Button>
            </EditEventDialog>
          </DialogFooter> */}
        </DialogContent>
      </Dialog>
    </>
  );
}
