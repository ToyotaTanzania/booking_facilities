"use client";

import { useDisclosure } from "@/hooks/use-disclosure";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from "@/components/ui/drawer";
import { Label } from "@/components/ui/label";
import { Input } from "@/src/components/ui/input";
import { MiniCalendar, MiniCalendarNavigation, MiniCalendarDays, MiniCalendarDay } from "@/components/ui/mini-calendar";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { api } from "@/trpc/react";
import { useSession } from "next-auth/react";
import { google, office365, outlook } from "calendar-link";

// Local helper drawers
function RejectDrawer({ resolvedBooking, note, setNote, onReject, open, onOpenChange }: { resolvedBooking: any, note: string, setNote: (v: string) => void, onReject: () => void, open?: boolean, onOpenChange?: (open: boolean) => void }) {
  const [localOpen, setLocalOpen] = useState(false);
  return (
    <Drawer open={open ?? localOpen} onOpenChange={onOpenChange ?? setLocalOpen} direction="right" nested>
      <Button variant="destructive" onClick={() => (onOpenChange ? onOpenChange(true) : setLocalOpen(true))}>Reject</Button>
      <DrawerContent className="p-0 h-full">
        <DrawerHeader className="p-4">
          <DrawerTitle>Reject Booking</DrawerTitle>
        </DrawerHeader>
        <div className="flex-1 px-4 flex items-center justify-center">
          <div className="w-full max-w-md space-y-3">
            <div className="space-y-2">
              <Label htmlFor="rejectNotes">Notes</Label>
              <Textarea id="rejectNotes" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Reason / notes" />
            </div>
          </div>
        </div>
        <DrawerFooter className="p-4">
          <Button variant="outline" onClick={() => (onOpenChange ? onOpenChange(false) : setLocalOpen(false))}>Cancel</Button>
          <Button
            disabled={!resolvedBooking}
            onClick={() => { onReject(); (onOpenChange ? onOpenChange(false) : setLocalOpen(false)); }}
            variant="destructive"
          >
            Confirm Reject
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function RescheduleDrawer({
  title,
  setTitle,
  newDate,
  setNewDate,
  newSlotIds,
  setNewSlotIds,
  slotsForSchedule,
  bookedSlotIds,
  note,
  setNote,
  onRescheduleConfirm,
  open,
  onOpenChange,
}: {
  title: string;
  setTitle: (v: string) => void;
  newDate: string;
  setNewDate: (v: string) => void;
  newSlotIds: number[];
  setNewSlotIds: (v: number[]) => void;
  slotsForSchedule: any[];
  bookedSlotIds: number[];
  note: string;
  setNote: (v: string) => void;
  onRescheduleConfirm: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [localOpen, setLocalOpen] = useState(false);
  const selectedSlots = (slotsForSchedule || []).filter((x: any) => (newSlotIds || []).includes(Number(x.id)));
  return (
    <Drawer open={open ?? localOpen} onOpenChange={onOpenChange ?? setLocalOpen} direction="right" nested>
      <Button variant="secondary" onClick={() => (onOpenChange ? onOpenChange(true) : setLocalOpen(true))}>Open Reschedule</Button>
      <DrawerContent className="p-0 h-full">
        <DrawerHeader className="p-4">
          <DrawerTitle>Reschedule Booking</DrawerTitle>
        </DrawerHeader>
        <div className="flex-1 px-4 flex justify-start">
          <div className="w-full max-w-md space-y-3">
            <div className="space-y-2">
              <Label htmlFor="rescheduleTitle">Title</Label>
              <Input id="rescheduleTitle" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Booking title" />
            </div>
            <div className="space-y-2">
              <Label>New Date</Label>
              <MiniCalendar
                value={newDate ? parseISO(newDate) : undefined}
                onValueChange={(d) => setNewDate(d ? format(d, "yyyy-MM-dd") : "")}
                days={7}
                className="justify-between"
              >
                <MiniCalendarNavigation direction="prev" />
                <MiniCalendarDays>
                  {(date) => <MiniCalendarDay date={date} />}
                </MiniCalendarDays>
                <MiniCalendarNavigation direction="next" />
              </MiniCalendar>
            </div>
            <div className="space-y-2">
              <Label>Available Slots</Label>
              <div className="grid grid-cols-3 gap-1">
                {(slotsForSchedule || []).map((slot: any) => {
                  const isBooked = (bookedSlotIds || []).includes(Number(slot.id));
                  const isSelected = (newSlotIds || []).includes(Number(slot.id));
                  const base = "px-1 py-1 text-xs rounded-md border transition-colors";
                  const stateClass = isBooked
                    ? "bg-rose-100 text-rose-700 border-rose-200 cursor-not-allowed opacity-60"
                    : isSelected
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-muted text-foreground hover:bg-muted/70";
                  return (
                    <button
                      key={slot.id}
                      type="button"
                      className={`${base} ${stateClass}`}
                      disabled={isBooked}
                      onClick={() => {
                        const idNum = Number(slot.id);
                        if ((newSlotIds || []).includes(idNum)) {
                          setNewSlotIds((newSlotIds || []).filter((id) => id !== idNum));
                        } else {
                          setNewSlotIds([...(newSlotIds || []), idNum]);
                        }
                      }}
                      aria-pressed={isSelected}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="leading-none">{slot.start} - {slot.end}</span>
                        {isBooked && <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-rose-500" />}
                        {isSelected && !isBooked && <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
              {selectedSlots && selectedSlots.length > 0 && (
                <div className="text-xs text-muted-foreground">
                  Selected ({selectedSlots.length}): {selectedSlots.map((s: any) => `${s.start} - ${s.end}`).join(", ")}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="rescheduleNotes">Notes</Label>
              <Textarea id="rescheduleNotes" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Notes for reschedule" />
            </div>
          </div>
        </div>
        <DrawerFooter className="p-4">
          <Button variant="outline" onClick={() => (onOpenChange ? onOpenChange(false) : setLocalOpen(false))}>Cancel</Button>
          <Button
            disabled={!newDate || !newSlotIds || newSlotIds.length === 0}
            onClick={() => { onRescheduleConfirm(); (onOpenChange ? onOpenChange(false) : setLocalOpen(false)); }}
            variant="secondary"
          >
            Reschedule & Confirm
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function CancelDrawer({ resolvedBooking, note, setNote, onCancel }: { resolvedBooking: any, note: string, setNote: (v: string) => void, onCancel: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <Drawer open={open} onOpenChange={setOpen} direction="right" nested>
      <Button variant="destructive" onClick={() => setOpen(true)}>Cancel Booking</Button>
      <DrawerContent className="p-0 h-full">
        <DrawerHeader className="p-4">
          <DrawerTitle>Cancel Booking</DrawerTitle>
        </DrawerHeader>
        <div className="flex-1 px-4 flex items-center justify-center">
          <div className="w-full max-w-md space-y-3">
            <div className="space-y-2">
              <Label htmlFor="cancelNotes">Notes</Label>
              <Textarea id="cancelNotes" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional reason / notes" />
            </div>
            <div className="rounded-md border p-3 text-sm">
              <div className="text-destructive font-medium">This action will permanently cancel the booking.</div>
              <div className="text-muted-foreground text-xs mt-1">You can’t undo this. Please confirm.</div>
            </div>
          </div>
        </div>
        <DrawerFooter className="p-4">
          <Button variant="outline" onClick={() => setOpen(false)}>Back</Button>
          <Button
            disabled={!resolvedBooking}
            onClick={() => { onCancel(); setOpen(false); }}
            variant="destructive"
          >
            Confirm Cancel
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

const EventDetails = ({
  event,
  children,
}: {
  event: any;
  children?: ReactNode;
}) => {
  const { isOpen, onOpen, onClose, onToggle } = useDisclosure();
  //   const ref = useClickAway(onClose);
  const { status, data: session } = useSession();

  // Load supporting data for actions
  const { data: dayBookings } = api.booking.searchBookings.useQuery({
    date: event?.date,
    facility: event?.facility?.id,
  }, { enabled: !!event?.date && !!event?.facility?.id });
  const { data: users } = api.auth.users.getAll.useQuery();

  const utils = api.useUtils();

  // Resolve underlying booking (first matching slot for this event)
  const resolvedBooking = useMemo(() => {
    if (!dayBookings || dayBookings.length === 0) return null;
    return dayBookings.find((b: any) => b?.slot?.start === event?.startSlot && b?.facility?.id === event?.facility?.id) || dayBookings[0] || null;
  }, [dayBookings, event]);

  const isOwner = useMemo(() => {
    if (!session || !event?.owner) return false;
    // Supabase user id is often under session.supabase.sub in this app
    const currentUserId = (session as any)?.supabase?.sub || session.user?.id;
    return currentUserId && (event?.owner?.userid === currentUserId || event?.owner?.id === currentUserId);
  }, [session, event]);

  const { data: responsibles } = api.facility.getResponsibles.useQuery();
  const isResponsible = useMemo(() => {
    if (!responsibles || !session || !event?.facility?.id) return false;
    const currentUserId = (session as any)?.supabase?.sub || session.user?.id;
    const rp = responsibles.find((p: any) => p?.facility?.id === event?.facility?.id);
    return rp?.user === currentUserId;
  }, [responsibles, session, event]);

  // Booked slots for this facility/date
  const bookedSlotIdsArr = useMemo(() => {
    return ((Array.isArray(dayBookings) ? dayBookings : []) as any[])
      .filter((b) => {
        const status = (b as any)?.status;
        return status !== 'rejected';
      })
      .map((b) => {
        if (typeof b === "number") return b;
        if (typeof b === "string") return Number(b);
        const id = b?.slot?.id ?? b?.slot ?? b?.id;
        return Number(id);
      })
      .filter((n) => Number.isFinite(n))
      .map((n) => Number(n));
  }, [dayBookings]);

  // Local states for actions
  const [note, setNote] = useState("");
  const [title, setTitle] = useState(event?.description || event?.name || "");
  const [manualEmail, setManualEmail] = useState<string>(event?.owner?.email || "");
  const [manualName, setManualName] = useState<string>(event?.owner?.name || "");
  const [manualPhone, setManualPhone] = useState<string>(event?.owner?.phone || "");
  const [newDate, setNewDate] = useState<string>(event?.date || "");
  const [newSlotIds, setNewSlotIds] = useState<number[]>([]);

  // Change booked user modal state & debounced email lookup
  const [changeUserOpen, setChangeUserOpen] = useState(false);
  const [emailQuery, setEmailQuery] = useState<string>(event?.owner?.email || "");
  const [debouncedEmail, setDebouncedEmail] = useState<string>("");
  const [foundUserId, setFoundUserId] = useState<string | null>(null);
  const [emailSearched, setEmailSearched] = useState(false);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  // Clear manual fields as soon as the user starts typing a new email
  const handleEmailChange = (value: string) => {
    setEmailQuery(value);
    setEmailSearched(false);
    setFoundUserId(null);
    setManualName("");
    setManualPhone("");
  };

  // Debounce typing for email
  useEffect(() => {
    const handler = setTimeout(() => {
      const trimmed = (emailQuery || "").trim();
      setDebouncedEmail(trimmed);
      setEmailSearched(!!trimmed);
    }, 500);
    return () => clearTimeout(handler);
  }, [emailQuery]);

  const { data: lookedUpUser, isFetching: isSearchingUser } = api.auth.users.getByEmail.useQuery(
    { email: debouncedEmail },
    { enabled: !!debouncedEmail }
  );

  // When a user is found by email, prefill name/phone and store id
  useEffect(() => {
    if (lookedUpUser) {
      setFoundUserId((lookedUpUser as any)?.userid || (lookedUpUser as any)?.id || null);
      setManualName((lookedUpUser as any)?.name || "");
      setManualPhone(((lookedUpUser as any)?.phone as string) || "");
      setManualEmail((lookedUpUser as any)?.email || emailQuery);
    } else {
      setFoundUserId(null);
    }
  }, [lookedUpUser]);

  // Load slots for rescheduling (based on booking.schedule)
  const scheduleId = resolvedBooking?.schedule;
  const { data: allSlotsBySchedule } = api.slots.getAll.useQuery(scheduleId ? { schedule: scheduleId } : undefined, { enabled: !!scheduleId });
  const slotsForSchedule = useMemo(() => {
    if (!scheduleId || !allSlotsBySchedule) return [] as any[];
    return allSlotsBySchedule[scheduleId] || [];
  }, [scheduleId, allSlotsBySchedule]);

  // Mutations
  const approveMutation = api.booking.accept.useMutation({
    onSuccess: async () => { toast.success("Booking approved"); await utils.booking.searchBookings.invalidate(); onClose(); },
    onError: (e) => toast.error(e.message),
  });
  const rejectMutation = api.booking.reject.useMutation({
    onSuccess: async () => { toast.success("Booking rejected"); await utils.booking.searchBookings.invalidate(); onClose(); },
    onError: (e) => toast.error(e.message),
  });
  const changeUserMutation = api.booking.changeUser.useMutation({
    onSuccess: async () => { toast.success("Booking user/title updated"); await utils.booking.searchBookings.invalidate(); onClose(); },
    onError: (e) => toast.error(e.message),
  });
  const createUserMutation = api.auth.users.create.useMutation({
    onSuccess: async (profile) => {
      toast.success("User created");
      // After creating, assign to booking
      if (!resolvedBooking) return;
      changeUserMutation.mutate({
        slot: resolvedBooking.slot.id,
        facility: resolvedBooking.facility.id,
        date: resolvedBooking.date,
        user: (profile as any)?.userid || (profile as any)?.id,
        description: title,
        comment: note || undefined,
      });
    },
    onError: (e) => toast.error(e.message),
  });
  const cancelMutation = api.booking.cancel.useMutation({
    onSuccess: async () => { toast.success("Booking cancelled"); await utils.booking.searchBookings.invalidate(); onClose(); },
    onError: (e) => toast.error(e.message),
  });
  const changeDateMutation = api.booking.changeDate.useMutation({
    onSuccess: async () => { toast.success("Booking rescheduled (pending)"); await utils.booking.searchBookings.invalidate(); onClose(); },
    onError: (e) => toast.error(e.message),
  });
  const rescheduleConfirmMutation = api.booking.rescheduleAndConfirm.useMutation({
    onSuccess: async () => { toast.success("Booking rescheduled & confirmed"); await utils.booking.searchBookings.invalidate(); onClose(); },
    onError: (e) => toast.error(e.message),
  });

  // Export helpers
  const exportTitle = event?.name || title || "Booking";
  const startDate = event?.start ? parseISO(event.start) : null;
  const endDate = event?.end ? parseISO(event.end) : null;
  const exportStart = startDate ? format(startDate, "yyyy-MM-dd'T'HH:mm:ss") : undefined;
  const exportEnd = endDate ? format(endDate, "yyyy-MM-dd'T'HH:mm:ss") : undefined;
  const exportDescription = event?.description || "";
  const exportLocation = event?.facility?.name || "";

  const handleExportOutlook = () => {
    const url = office365({ title: exportTitle, start: event?.date && event?.start ? new Date(parseISO(event.date).setHours(parseISO(event.start).getHours(), parseISO(event.start).getMinutes())) : exportStart!, end: event?.date && event?.end ? new Date(parseISO(event.date).setHours(parseISO(event.end).getHours(), parseISO(event.end).getMinutes())) : exportEnd!, description: exportDescription, location: exportLocation });
    window.open(url, "_blank", "noopener,noreferrer");
  };
  const handleExportGoogle = () => {
    const url = google({ title: exportTitle, start: exportStart!, end: exportEnd!, description: exportDescription, location: exportLocation });
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    
        <Sheet onOpenChange={(open) => (open ? onOpen() : onClose())} open={isOpen}>
          <SheetTrigger asChild>
            <div className="flex h-full w-full flex-col gap-1 p-2">
                {children}  
            </div>
          </SheetTrigger>
          <SheetContent onInteractOutside={(e) => e.preventDefault()} className="p-4">
            <SheetHeader>
              <SheetTitle>
                {event?.name || "Event Details"}
              </SheetTitle>
            </SheetHeader>
            <div className="space-y-4 px-2">
              <div className="rounded-md border p-3 text-sm">
                <div className="flex justify-between">
                  <div>
                    <div>Facility: {event?.facility?.name}</div>
                    <div className="text-muted-foreground">{event?.facility?.building?.name} • {event?.facility?.building?.location}</div>
                  </div>
                  <div className="text-right">
                    <div>Status: {event?.status}</div>
                    <div className="text-muted-foreground">{format(parseISO(event?.date), 'dd MMM yyyy')}</div>
                  </div>
                </div>
                <div className="mt-2 text-muted-foreground">By: {event?.owner?.name} ({event?.owner?.email})</div>
              </div>

              {/* Title change available for both owner and responsible */}
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Booking title" />
                <div className="flex gap-2">
                  <Button
                    disabled={!resolvedBooking}
                    onClick={() => {
                      if (!resolvedBooking) return toast.error("No booking found");
                      changeUserMutation.mutate({
                        slot: resolvedBooking.slot.id,
                        facility: resolvedBooking.facility.id,
                        date: resolvedBooking.date,
                        user: resolvedBooking.user.userid,
                        description: title,
                        comment: note || undefined,
                      });
                    }}
                    variant="secondary"
                  >
                    Save Title
                  </Button>
                </div>
              </div>

              <Separator />

            

              {/* Owner actions */}
              {isOwner && (
                <div className="space-y-4">
                  <div className="text-sm font-medium">Your Booking Actions</div>
                  {event?.status === 'pending' ? (
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>New Date</Label>
                        <MiniCalendar
                          value={newDate ? parseISO(newDate) : undefined}
                          onValueChange={(d) => setNewDate(d ? format(d, "yyyy-MM-dd") : "")}
                          days={7}
                          className="justify-between"
                        >
                          <MiniCalendarNavigation direction="prev" />
                          <MiniCalendarDays>
                            {(date) => <MiniCalendarDay date={date} />}
                          </MiniCalendarDays>
                          <MiniCalendarNavigation direction="next" />
                        </MiniCalendar>
                        <Button
                          disabled={!resolvedBooking || !newDate}
                          onClick={() => {
                            if (!resolvedBooking || !newDate) return;
                            changeDateMutation.mutate({ id: resolvedBooking.id, date: newDate, comment: note || undefined });
                          }}
                        >
                          Reschedule (Pending)
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <CancelDrawer
                          resolvedBooking={resolvedBooking}
                          note={note}
                          setNote={setNote}
                          onCancel={() => { if (!resolvedBooking) return; cancelMutation.mutate({ id: resolvedBooking.id, comment: note || undefined }); }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">Booking is accepted; details are read-only.</div>
                  )}
                </div>
              )}

             

              {/* Export options */}
              <div className="space-y-2">
                <div className="text-sm font-medium">Export</div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleExportOutlook}>Outlook</Button>
                  <Button variant="outline" onClick={handleExportGoogle}>Google</Button>
                </div>
              </div>
            </div>

            <SheetFooter>
                
              <div className="flex flex-wrap flex-col space-y-4 justify-end gap-6 mr-2">
                <Separator />
                {isResponsible && (
                    <div>
                <Button
                  variant="secondary"
                   className="w-full"
                  disabled={!resolvedBooking}
                  onClick={() => setChangeUserOpen(true)}
                >
                  Change User
                </Button>
                <Button
                  variant="secondary"
                   className="w-full mt-4"
                  disabled={!resolvedBooking}
                  onClick={() => setRescheduleOpen(true)}
                >
                  Reschedule
                </Button>
                <Button
                  disabled={!resolvedBooking}
                    className="w-full mt-4"
                  onClick={() => {
                    const scheduleId = resolvedBooking?.schedule;
                    if (!resolvedBooking || typeof scheduleId !== "number") {
                      toast.error("Missing schedule identifier for approval.");
                      return;
                    }
                    approveMutation.mutate({
                      slot: Number(resolvedBooking.slot.id),
                      facility: Number(resolvedBooking.facility.id),
                      date: resolvedBooking.date,
                      schedule: scheduleId,
                      comment: note || undefined,
                    });
                  }}
                >
                  Approve
                </Button>
                <Button
                  variant="destructive"
                  className="w-full mt-4"
                  disabled={!resolvedBooking}
                  onClick={() => setRejectOpen(true)}
                >
                  Reject
                </Button>
                </div>
              )}
              </div>
              
              <SheetClose asChild className="mt-3">
                <Button type="button" variant="outline">Close</Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
  );
};

export default EventDetails;
