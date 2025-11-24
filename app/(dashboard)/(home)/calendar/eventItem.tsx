"use client";
import { office365, outlook } from "calendar-link";
import { Badge } from "@/components/ui/badge";
import { capitalize } from "lodash";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { format, parseISO, isValid } from "date-fns";

import {
  Status,
  StatusIndicator,
  StatusLabel,
} from "@/src/components/kibo-ui/status";
import EventDetails from "./eventDatails";

const Colors = {
  rejected: "#F87171",
  approved: "#10B981",
  confirmed: "#10B981",
  pending: "#F59E0B",
  default: "#cecece",
};

const StatusMap = {
  rejected: "offline",
  approved: "online",
  confirmed: "online",
  pending: "degraded",
};

type statuses = keyof typeof Colors;

const EventItem = ({ event }: { event: any }) => {
  const parseDate = (d: string | Date | undefined): Date | null => {
    if (!d) return null;
    if (d instanceof Date) {
      return isValid(d) ? d : null;
    }
    // Try ISO parse first
    const isoParsed = parseISO(d);
    if (isValid(isoParsed)) return isoParsed;
    // Fallback to native Date parser
    const nativeParsed = new Date(d);
    return isValid(nativeParsed) ? nativeParsed : null;
  };

  const formatDate = (d: Date | null) =>
    d && isValid(d) ? format(d, "dd MMM yyyy") : "";
  const formatTime = (d: string) => {
    const parsed = d ? parseISO(d) : null;

    return parsed && isValid(parsed) ? format(parsed, "HH:mm") : "";
  };

  const OutlookLink = () => {
    const url = office365({
      title: event?.name || "Booking",
      // start: formatTime(event.start) || "",
      // end: formatTime(event.end) || "",
      start: createDateFromEventDateAndTime(event.date, event.start),
      end: createDateFromEventDateAndTime(event.date, event.end),
      description: event?.description || "",
      location: event?.facility?.name || "",
    });
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const createDateFromEventDateAndTime = (date: string, time: string) => {
    const parsedDate = parseISO(date);
    const parsedTime = parseISO(time);
    return new Date(
      parsedDate.setHours(
        parsedTime.getHours(),
        parsedTime.getMinutes(),
        parsedTime.getSeconds(),
      ),
    );
  };

  const status: statuses = event.status as statuses;

  return (
     <EventDetails event={event}>
     
        <div className="flex flex-col items-start gap-1 text-xs">
          <span className="font-medium">{event?.owner?.name || ""}</span>
          <span className="font-medium">{event?.name}</span>
        </div>

        <div className="flex items-center justify-between">
          {formatDate(new Date(event.date))}
        </div>

        <Status status={StatusMap[status] || "default"}>
          <StatusIndicator />
          <StatusLabel className="font-mono">
            {formatTime(event.start)} – {formatTime(event.end)}
          </StatusLabel>
        </Status>

        <div className="flex items-center gap-2">
          <Button
            onClick={OutlookLink}
            variant="ghost"
            className="h-6 cursor-pointer px-2 text-xs"
          >
            <Calendar className="mr-1 h-3 w-3" /> Add to Calendar
          </Button>
        </div>
      </EventDetails>
  );
};

export default EventItem;
