"use client";

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
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users } from "lucide-react";

interface ViewScheduleSlotsModalProps {
  schedules: {
    id: number;
    name: string;
    start_time: string;
    end_time: string;
  } | null;
  slots: Array<{
    id: number;
    start: string;
    end: string;
    size: number;
  }>;
  facilityName: string | null;
  trigger: React.ReactNode;
}

export function ViewScheduleSlotsModal({
  schedules,
  slots,
  facilityName,
  trigger,
}: ViewScheduleSlotsModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{ facilityName }  - { schedules?.name } </DialogTitle>
          <DialogDescription>
            View all schedules and time slots for {facilityName || "this facility"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          {slots.map((slot) => (
            <div key={slot.id} className="rounded-lg p-1 border-b rounded-b-none">
              <div className="flex items-center gap-2 justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-lg">{slot.start} - {slot.end}</h3>
                </div>
                <Badge variant="secondary">
                  {slot.size} booking{slot.size > 1 ? "s" : ""}
                </Badge>
              </div>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => {}}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
