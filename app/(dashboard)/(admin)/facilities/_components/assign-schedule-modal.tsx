"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { Calendar, Clock } from "lucide-react";

interface AssignScheduleModalProps {
  facilityId: number;
  facilityName: string | null;
  trigger: React.ReactNode;
}

interface Schedule {
  id: number;
  name: string;
  slots?: Array<{
    id: number;
    start: string;
    end: string;
    start_time: string | null;
    end_time: string | null;
    size: number;
  }>;
}

export function AssignScheduleModal({
  facilityId,
  facilityName,
  trigger,
}: AssignScheduleModalProps) {
  const [open, setOpen] = useState(false);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>("");
  const [scheduleName, setScheduleName] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");

  const utils = api.useUtils();

  // Fetch available schedules
  const { data: schedules } = api.schedule.getScheduleWithSlots.useQuery();
  const typedSchedules = schedules as Schedule[] | undefined;

  // Create schedule mutation
  const { mutate: createSchedule, isPending: isCreating } =
    api.schedule.create.useMutation({
      onSuccess: () => {
        toast.success("Schedule created and assigned successfully");
        setOpen(false);
        void utils.facility.list.invalidate();
        void utils.schedule.list.invalidate();
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

  // Update schedule mutation (to assign existing schedule)
  const { mutate: updateSchedule, isPending: isUpdating } =
    api.facility.updateSchedule.useMutation({
      onSuccess: () => {
        toast.success("Schedule assigned successfully");
        setOpen(false);
        void utils.facility.list.invalidate();
        void utils.schedule.list.invalidate();
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

  // Handle schedule selection
  const handleScheduleSelect = (scheduleId: string) => {
    setSelectedScheduleId(scheduleId);
    const selectedSchedule = typedSchedules?.find(
      (schedule) => schedule.id.toString() === scheduleId,
    );
    if (selectedSchedule) {
      setScheduleName(selectedSchedule.name);
      setStartTime(selectedSchedule.start_time ?? "");
      setEndTime(selectedSchedule.end_time ?? "");
    }
  };

  // Handle form submission for assigning existing schedule
  const handleAssignExisting = () => {
    if (!selectedScheduleId) {
      toast.error("Please select a schedule");
      return;
    }

    updateSchedule({
      id: facilityId,
      schedule: parseInt(selectedScheduleId),
    });
  };

  // Handle form submission for creating new schedule
  const handleCreateNew = () => {
    if (!scheduleName || !startTime || !endTime) {
      toast.error("Please fill in all fields");
      return;
    }

    createSchedule({
      name: scheduleName,
      start_time: startTime,
      end_time: endTime,
      facility: facilityId,
    });
  };

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!open) {
      setSelectedScheduleId("");
      setScheduleName("");
      setStartTime("");
      setEndTime("");
    }
  }, [open]);

  const isPending = isCreating || isUpdating;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Assign Schedule</DialogTitle>
          <DialogDescription>
            Assign a schedule to {facilityName ?? "this facility"}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="schedule">Select Existing Schedule</Label>
            <Select
              value={selectedScheduleId}
              onValueChange={handleScheduleSelect}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose an existing schedule" />
              </SelectTrigger>
              <SelectContent>
                {typedSchedules?.map((schedule) => (
                  <SelectItem key={schedule.id} value={schedule.id.toString()}>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{schedule.name}</span>
                      <span className="text-muted-foreground text-xs">
                        {schedule.start_time ?? "No time"} -{" "}
                        {schedule.end_time ?? "No time"}
                        {schedule.slots && schedule.slots.length > 0 && (
                          <span className="ml-1">
                            ({schedule.slots.length} slots)
                          </span>
                        )}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Show selected schedule details */}
            <div className="h-56 overflow-auto">
              {selectedScheduleId &&
                (() => {
                  const selectedSchedule = typedSchedules?.find(
                    (s) => s.id.toString() === selectedScheduleId,
                  );
                  return selectedSchedule ? (
                    <div className="bg-muted mt-2 rounded-md p-3">
                      <h4 className="mb-2 text-sm font-medium">
                        Selected Schedule: {selectedSchedule.name}
                      </h4>
                      {selectedSchedule.slots &&
                      selectedSchedule.slots.length > 0 ? (
                        <div className="space-y-1">
                          <p className="text-muted-foreground text-xs">
                            Time Slots:
                          </p>
                          {selectedSchedule.slots.map((slot, index) => (
                            <div
                              key={slot.id}
                              className="bg-background rounded border p-2 text-xs"
                            >
                              <span className="font-medium">
                                Slot {index + 1}:
                              </span>{" "}
                              {slot.start} - {slot.end} (Capacity: {slot.size})
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-xs">
                          No time slots defined
                        </p>
                      )}
                    </div>
                  ) : null;
                })()}
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>

          {selectedScheduleId ? (
            <Button
              type="button"
              onClick={handleAssignExisting}
              disabled={isPending}
            >
              {isPending ? "Assigning..." : "Assign Schedule"}
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleCreateNew}
              disabled={isPending || !scheduleName || !startTime || !endTime}
            >
              {isPending ? "Creating..." : "Create & Assign Schedule"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
