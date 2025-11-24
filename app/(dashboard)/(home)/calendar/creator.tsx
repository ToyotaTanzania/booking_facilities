"use client";

import { useDisclosure } from "@/hooks/use-disclosure";
import { useEffect, useState } from "react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { useSession } from "next-auth/react";
import { Input } from "@/src/components/ui/input";
import { api } from "@/trpc/react";
import { toast } from "sonner";

import { eventSchema, type TEventFormData } from "@/calendar/schemas";

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

import {
  Form,
  FormField,
  FormLabel,
  FormItem,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JSONTree } from "react-json-tree";

type IProps = {
  location: string;
  building: {
    id: number;
    name: string;
  };
  facility: {
    id: number;
    name: string;
  };
  date?: Date | string;
  bookings?: any;
  schedule?: any;
  slots?: any;
};

type Slot = { id: number; start: string; end: string };

const EventCreator = ({ data, date, bookings }: any) => {
  const { isOpen, onOpen, onClose, onToggle } = useDisclosure();

  const form = useForm<TEventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      location: data.building.location,
      building: data.building.id,
      room: data.id,
      title: "",
      slots: [],
      date: date,
    },
  });

  // Local slot state, fetched from schedule
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectionMode, setSelectionMode] = useState<"none" | "single" | "range">("none");
  const [rangeStart, setRangeStart] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Fetch schedule slots for the current facility
  const scheduleId = data?.schedule as number | undefined;
  const { data: schedule } = api.schedule.getById.useQuery(scheduleId as number, {
    enabled: Boolean(scheduleId),
  });

  // Already booked slots for this facility/date
  // Supports both numeric arrays (e.g., [1,2,3]) and object arrays (e.g., [{ slot: { id: 1 } }, { slot: 2 }])
  const bookedSlotIds = new Set<number>(
    ((Array.isArray(bookings) ? bookings : []) as any[])
      .map((b) => {
        if (typeof b === "number") return b;
        if (typeof b === "string") return Number(b);
        const id = b?.slot?.id ?? b?.slot ?? b?.id;
        return Number(id);
      })
      .filter((n) => Number.isFinite(n))
      .map((n) => Number(n))
  );

  // Initialize local slots when schedule loads
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (schedule?.slots) {
      setSlots(((schedule.slots ?? []) as unknown as Slot[]) || []);
    }
  }, [schedule]);

  const isSlotInRange = (slotIndex: number) => {
    if (selectionMode !== "range" || rangeStart === null) return false;
    if (hoveredIndex === null) return slotIndex === rangeStart;
    const start = Math.min(rangeStart, hoveredIndex);
    const end = Math.max(rangeStart, hoveredIndex);
    return slotIndex >= start && slotIndex <= end;
  };

  const handleRangeStart = (slotId: string, slotIndex: number) => {
    setSelectionMode("range");
    setRangeStart(slotIndex);
    setHoveredIndex(slotIndex);
  };

  const handleSlotHover = (slotIndex: number) => {
    if (selectionMode === "range") setHoveredIndex(slotIndex);
  };

  const handleMouseLeave = () => {
    if (selectionMode === "range") {
      setSelectionMode("none");
      setRangeStart(null);
      setHoveredIndex(null);
    }
  };

  const handleSlotClick = (
    slotId: string,
    slotIndex: number,
    slotsList: Slot[],
    fieldOnChange: (value: string[]) => void,
  ) => {
    // Block interaction for already booked slots
    const numericId = Number(slotId);
    if (bookedSlotIds.has(numericId)) return;

    const currentSlots = form.getValues("slots") ?? [];
    const isSelected = currentSlots.includes(slotId);

    if (selectionMode === "none") {
      const newSlots = isSelected
        ? currentSlots.filter((id) => id !== slotId)
        : [...currentSlots, slotId];
      form.setValue("slots", newSlots);
      fieldOnChange(newSlots);
    } else if (selectionMode === "range") {
      if (rangeStart !== null) {
        if (rangeStart === slotIndex) {
          const newSlots = isSelected
            ? currentSlots.filter((id) => id !== slotId)
            : [...currentSlots, slotId];
          form.setValue("slots", newSlots);
          fieldOnChange(newSlots);
        } else {
          const start = Math.min(rangeStart, slotIndex);
          const end = Math.max(rangeStart, slotIndex);
          const slotsInRangeAll = slotsList.slice(start, end + 1).map((s) => String(s.id));
          const slotsInRange = slotsInRangeAll.filter((id) => !bookedSlotIds.has(Number(id)));
          const firstSlot = slotsList[rangeStart];
          if (!firstSlot) {
            setSelectionMode("none");
            setRangeStart(null);
            setHoveredIndex(null);
            return;
          }
          // Do not allow range actions to start from a booked slot
          if (bookedSlotIds.has(Number(firstSlot.id))) {
            setSelectionMode("none");
            setRangeStart(null);
            setHoveredIndex(null);
            return;
          }
          const firstSlotId = String(firstSlot.id);
          const firstSlotSelected = currentSlots.includes(firstSlotId);

          const newSlots = firstSlotSelected
            ? currentSlots.filter((id) => !slotsInRange.includes(id))
            : [...new Set([...currentSlots, ...slotsInRange])];

          form.setValue("slots", newSlots);
          fieldOnChange(newSlots);
        }
      }
      setSelectionMode("none");
      setRangeStart(null);
      setHoveredIndex(null);
    }
  };

  const utils = api.useUtils();
  const { mutate: createBooking, isPending } = api.booking.userBooking.useMutation({
    onSuccess: async () => {
      toast.success("Booking created successfully");
      await utils.booking.searchBookings.invalidate();
      onClose();
      form.reset();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create booking");
    },
  });

  const onSubmit = (_values: TEventFormData) => {
    // Use facility schedule directly
    const scheduleNum = Number(scheduleId) || 0;
    createBooking({
      ..._values,
      schedule: scheduleNum,
    });
  };

  return (
    <div>
      <AlertDialog open={isOpen} onOpenChange={onToggle}>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" className="h-12 w-12 cursor-pointer">
            <Plus />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              <div>
                <div>{data.name}</div>
                <div className="text-muted-foreground text-sm">
                  {data.building.location} - {data.building.name}
                </div>
              </div>
            </AlertDialogTitle>
            <AlertDialogDescription>
              <Form {...form}>
                <form
                  id="event-form"
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="grid gap-4 py-4"
                >
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
                    name="slots"
                    render={({ field }) => {
                      const currentSlots: Slot[] = (slots ?? []) as Slot[];
                      const selectedSlots: string[] = Array.isArray(field.value)
                        ? field.value
                        : [];

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
                              className={`max-h-60 overflow-y-auto rounded-md border p-2 transition-colors ${
                                selectionMode === "range"
                                  ? "border-primary/50 bg-primary/5"
                                  : "border-gray-200 bg-white"
                              }`}
                              onMouseLeave={handleMouseLeave}
                            >
                              {currentSlots.length > 0 ? (
                                <div className="grid grid-cols-1 gap-1">
                                  {currentSlots.map((slot: Slot, index: number) => {
                                    const value = String(slot.id);
                                    const isSelected = selectedSlots.includes(value);
                                    const isInRange = isSlotInRange(index);
                                    const isRangeStart = selectionMode === "range" && rangeStart === index;
                                    const isRangeEnd = selectionMode === "range" && hoveredIndex === index && hoveredIndex !== rangeStart;
                                    const isBooked = bookedSlotIds.has(Number(slot.id));

                                    return (
                                      <div
                                        key={value}
                                        className={`relative flex items-center justify-between rounded-md border-2 p-3 transition-all duration-150 ${
                                          isBooked
                                            ? "cursor-not-allowed opacity-50 border-gray-200 bg-white pointer-events-none"
                                            : isSelected
                                              ? "cursor-pointer border-primary bg-primary/10 text-primary"
                                              : isInRange
                                                ? "cursor-pointer border-primary/50 bg-primary/5 text-primary/80"
                                                : "cursor-pointer border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                                        } ${isRangeStart ? "rounded-t-md" : ""} ${isRangeEnd ? "rounded-b-md" : ""} ${isInRange && !isRangeStart && !isRangeEnd ? "rounded-none" : ""}`}
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();

                                          if (isBooked) return;

                                          if (e.shiftKey) {
                                            // Shift+click to start range selection
                                            handleRangeStart(value, index);
                                          } else {
                                            // Normal click
                                            handleSlotClick(value, index, currentSlots, field.onChange);
                                          }
                                        }}
                                        onMouseEnter={() => { if (!isBooked) handleSlotHover(index); }}
                                      >
                                        <div className="flex items-center gap-3">
                                          <div
                                            className={`h-4 w-4 rounded-full border-2 transition-all ${
                                              isBooked
                                                ? "border-gray-300 bg-gray-100"
                                                : isSelected
                                                  ? "border-primary bg-primary"
                                                  : isInRange
                                                    ? "border-primary/50 bg-primary/20"
                                                    : "border-gray-300 bg-white"
                                            }`}
                                          >
                                            {isSelected && !isBooked && (
                                              <div className="h-full w-full scale-50 rounded-full bg-white" />
                                            )}
                                          </div>
                                          <span className="text-sm font-medium">
                                            {slot.start} - {slot.end}
                                          </span>
                                        </div>

                                        {isBooked ? (
                                          <span className="text-muted-foreground text-xs">Booked</span>
                                        ) : (
                                          isInRange && (
                                            <div className="text-primary/60 text-xs font-medium">
                                              {isRangeStart ? "Start" : isRangeEnd ? "End" : "Range"}
                                            </div>
                                          )
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                <div className="flex items-center justify-center py-8">
                                  <p className="text-sm text-gray-500">No slots available.</p>
                                </div>
                              )}
                            </div>
                          </FormControl>

                          {selectedSlots.length > 0 && (
                            <div className="rounded-md bg-green-50 p-3">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-green-800">
                                    Selected {selectedSlots.length} slot{selectedSlots.length !== 1 ? "s" : ""}
                                  </p>
                                  <p className="mt-1 text-xs text-green-600">
                                    {(() => {
                                      const selectedSlotObjects: Slot[] = currentSlots.filter((s) => selectedSlots.includes(String(s.id)));
                                      if (selectedSlotObjects.length === 0) return "No slots found";
                                      const sorted = [...selectedSlotObjects].sort((a, b) => {
                                        const aIndex = currentSlots.findIndex((s) => s.id === a.id);
                                        const bIndex = currentSlots.findIndex((s) => s.id === b.id);
                                        return aIndex - bIndex;
                                      });
                                      const first = sorted[0];
                                      const last = sorted[sorted.length - 1];
                                      const isConsecutive =
                                        sorted.length > 1 &&
                                        sorted.every((slot, i) => {
                                          if (i === 0) return true;
                                          const prev = sorted[i - 1];
                                          if (!prev) return true; // Defensive guard
                                          const prevIndex = currentSlots.findIndex(
                                            (s) => s.id === prev.id,
                                          );
                                          const curIndex = currentSlots.findIndex(
                                            (s) => s.id === slot.id,
                                          );
                                          return (
                                            prevIndex !== -1 && curIndex === prevIndex + 1
                                          );
                                        });
                                      if (sorted.length === 1 && first) return `${first.start} - ${first.end}`;
                                      if (isConsecutive && first && last) return `${first.start} to ${last.end}`;
                                      return sorted.map((s) => `${s.start}-${s.end}`).join(", ");
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

                  <div className="flex w-full justify-end gap-6">
                    <Button
                      type="button"
                      className="cursor-pointer"
                      variant="outline"
                      onClick={() => {
                        form.reset();
                        onClose();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      form="event-form"
                      className="cursor-pointer"
                      type="submit"
                      disabled={isPending}
                    >
                      Confirm
                    </Button>
                  </div>
                </form>
              </Form>
            </AlertDialogDescription>
          </AlertDialogHeader>
          {/* <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>Create</AlertDialogAction>
          </AlertDialogFooter> */}
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EventCreator;
