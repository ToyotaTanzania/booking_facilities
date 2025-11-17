"use client";
import { office365, outlook } from "calendar-link";
import { Badge } from "@/components/ui/badge";
import { capitalize } from "lodash";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { format, parseISO, isValid } from "date-fns";

const Colors = {
  rejected: "#F87171",
  approved: "#10B981",
  confirmed: "#10B981",
  pending: "#F59E0B",
  default: "#cecece",
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
    // extract the last valid ISO timestamp
    const match = d.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/);
    const clean = match ? match[0] : null;

    const parsed = clean ? parseISO(clean) : null;

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
    console.log(url);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const createDateFromEventDateAndTime = (date: string, time: string) => {
    const parsedDate = parseISO(date);
    const parsedTime = parseISO(time);
    return new Date(parsedDate.setHours(parsedTime.getHours(), parsedTime.getMinutes(), parsedTime.getSeconds()));
  }

  const status: statuses = event.status as statuses;

  return (
    <div className="flex flex-col gap-1">
      <div className="text-xs">
        <span className="font-medium">{event?.name}</span>
      </div>

      <Badge
          className="rounded-full px-2 py-0.5 text-[10px] font-medium"
          style={{
            backgroundColor: Colors[status] || Colors.default,
            color: "#ffffff",
            borderColor: Colors[status] || Colors.default,
          }}
        >
          {capitalize(status)}
        </Badge>
      {/* <div className="text-muted-foreground text-xs">
       
      </div> */}

      <div className="flex items-center justify-between">
      

         {formatDate(new Date(event.date))}

        <div className="text-muted-foreground text-xs">
          {formatTime(event.start)} – {formatTime(event.end)}
        </div>

      </div>

      <div className="flex items-center gap-2">
        <Button
          onClick={OutlookLink}
          variant="ghost"
          className="h-6 px-2 text-xs cursor-pointer"
        >
          <Calendar className="mr-1 h-3 w-3 " /> Add to Calendar
        </Button>
      </div>
    </div>
  );
};

export default EventItem;
