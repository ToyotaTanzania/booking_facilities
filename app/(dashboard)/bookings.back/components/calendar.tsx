"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { Calendar, Clock, HomeIcon, CheckCircle, XCircle, Clock as ClockIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import _ from "lodash";
import { useSession } from "next-auth/react";
import { Approve } from "./approve";
import { api } from "@/trpc/react";
import { toast } from "sonner";

interface Booking {
  id: number;
  start: string;
  end: string;
  size: number;
  status: "available" | "pending" | "rejected";
  user_id?: string;
}

interface ScheduleSlot {
  id: number;
  start: string;
  end: string;
  size: number;
  start_time: string;
  end_time: string;
  schedule: number;
  created_at: string;
}

interface DailyCalendarProps {
  date?: Date;
  room?: string;
  key: string;
}

export function DailyCalendar({
  date = new Date(),
  room
}: DailyCalendarProps) {
  const { data: session } = useSession();
  const [selectedSlots, setSelectedSlots] = useState<Set<number>>(new Set());
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const { slots, bookings, building } = room
  const { location } = building

  if (!session) {
    return <div>Loading...</div>;
  }

  const utils = api.useUtils();
  const { mutate: createBooking } = api.booking.create.useMutation({ 
    onSuccess: () => {
      toast.success("Booking created successfully");
      utils.facility.getAllByDate.invalidate();
      setSelectedSlots(new Set());
      setShowConfirmModal(false);
    },
    onError: () => {
      toast.error("Failed to create booking");
    },
  });

  // Get booking status for a slot
  const getSlotStatus = (slot: ScheduleSlot): "available" | "pending" | "rejected" => {
    const booking = bookings.find(b => b.slot === slot.id);
    return booking?.status ?? "available";
  };

  // Get booking for a slot
  const getSlotBooking = (slot: ScheduleSlot): any | undefined => {
    return bookings.find(b => b.slot === slot.id);
  };

  // Handle slot selection
  const handleSlotSelection = (slotId: number, checked: boolean) => {
    const newSelectedSlots = new Set(selectedSlots);
    if (checked) {
      newSelectedSlots.add(slotId);
    } else {
      newSelectedSlots.delete(slotId);
    }
    setSelectedSlots(newSelectedSlots);
  };

  // Get selected slots data
  const getSelectedSlotsData = () => {
    return slots.filter((slot: ScheduleSlot) => selectedSlots.has(slot.id)) as ScheduleSlot[];
  };

  // Handle booking confirmation
  const handleConfirmBooking = async () => {
    try {
      const selectedSlotsData = getSelectedSlotsData();

      createBooking({
        slots: selectedSlotsData.map(slot => slot.id),
        date: date.toISOString(),
        facility: room?.id as number,
        schedule: room?.schedule as number,
      });
      // Reset selection and close modal
      setSelectedSlots(new Set());
      setShowConfirmModal(false);
      
      // Show success message
      // toast.success("Booking confirmed successfully!");
    } catch (error) {
      console.error("Error confirming booking:", error);
      // toast.error("Failed to confirm booking");
    }
  };

  // Get status badge
  const getStatusBadge = (status: "available" | "pending" | "rejected") => {
    switch (status) {
      case "confirmed":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Confirmed
          </Badge>
        );
      case "available":
        return (
          <Badge variant="secondary" className="bg-grey-100 text-gray-800 border-gray-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Available
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <ClockIcon className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-800 border-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return null;
    }
  };

  // Check if slot can be selected (only available slots)
  const canSelectSlot = (slot: ScheduleSlot) => {
    return getSlotStatus(slot) === "available";
  };

  return (
    <div className="w-full">
      <div className="bg-background overflow-hidden rounded-md border">
        <div>
          <Breadcrumb className="border-b pb-4 flex justify-center mt-4">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="#">{_.upperCase(location?.name ?? "Location")}</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator> · </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbLink href="#">{_.upperCase(building?.name ?? "Building")}</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator> · </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbPage>{_.upperCase(room?.name ?? "Room")}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Header with date and booking button */}
        <div className="p-4 border-b bg-muted/30">
          <div className="flex items-center justify-end">
            {/* <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <h4 className="text-lg font-semibold">
                {format(date, "EEEE, MMMM d, yyyy")}
              </h4>
            </div> */}

            
           
              <Button 
                onClick={() => setShowConfirmModal(true)}
                className="bg-primary hover:bg-primary/90"
                disabled={selectedSlots.size === 0}
              >
                Book Slots ({selectedSlots.size})
              </Button>
            
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="*:border-border hover:bg-transparent [&>:not(:last-child)]:border-r">
              <TableHead className="bg-muted/50 py-2 font-medium w-16">Select</TableHead>
              <TableHead className="bg-muted/50 py-2 font-medium">Time Slot</TableHead>
              <TableHead className="py-2">Status</TableHead>
              <TableHead className="py-2">Booked By</TableHead>
              <TableHead className="py-2"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {slots?.map((slot: ScheduleSlot) => {
              const status = getSlotStatus(slot);
              const canSelect = canSelectSlot(slot);
              const isSelected = selectedSlots.has(slot.id);
              
              return (
                <TableRow
                  className="*:border-border hover:bg-transparent [&>:not(:last-child)]:border-r"
                  key={slot.id}
                >
                  <TableCell className="bg-muted/50 py-2">
                    {canSelect && (
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => 
                          handleSlotSelection(slot.id, checked as boolean)
                        }
                        className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                    )}
                  </TableCell>
                  <TableCell className="bg-muted/50 py-2 font-medium">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      {slot.start} - {slot.end}
                    </div>
                  </TableCell>
                  <TableCell className="py-2">
                    <div className="flex  gap-2 flex-col">
                      {getStatusBadge(status)}
                      
                    </div>
                  </TableCell>
                  <TableCell className="py-2">
                    <span>{ getSlotBooking(slot)?.description }</span>
                  </TableCell>
                  <TableCell className="py-2">
                    { 
                     room?.responsible_person && session.supabase.sub === room?.responsible_person?.user && status.toLowerCase()==='pending' ? (
                        <Approve
                          booking={getSlotBooking(slot)}
                        />
                     ) : null
                    }
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

  
      {/* Confirmation Modal */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Confirm Booking</DialogTitle>
            <DialogDescription>
              Please review your selected time slots before confirming the booking.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Date: {format(date, "EEEE, MMMM d, yyyy")}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <HomeIcon className="h-4 w-4" />
                <span>Location: {location?.name} • {building?.name} • {room?.name}</span>
              </div>
              
              <div className="border-t pt-3">
                <h4 className="font-medium mb-2">Selected Time Slots:</h4>
                <div className="space-y-2">
                  {getSelectedSlotsData().map((slot: ScheduleSlot) => (
                    <div key={slot.id} className="flex items-center justify-between p-2 bg-muted rounded-md">
                      <span className="font-medium">{slot.start} - {slot.end}</span>
                      <Badge variant="outline">Size: {slot.size}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmBooking} className="bg-primary hover:bg-primary/90">
              Confirm Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
