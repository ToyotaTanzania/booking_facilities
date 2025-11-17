'use client'
import { office365, outlook } from "calendar-link"
import { Badge } from "@/components/ui/badge"
import { capitalize } from "lodash"
import { Button } from "@/components/ui/button"
import { Calendar } from "lucide-react"
import { format, parseISO, isValid } from "date-fns"

const Colors = { 
  "rejected": "#F87171",
  "approved": "#10B981",
  "confirmed": "#10B981",
  "pending": "#F59E0B",
  "default": "#cecece",
}

type statuses = keyof typeof Colors

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

  const startDate = parseDate(event?.start ?? event?.startAt);
  const endDate = parseDate(event?.end ?? event?.endAt);

  console.log(startDate, endDate)
  console.log(event.start)

  const formatDate = (d: Date | null) => (d && isValid(d) ? format(d, 'dd MMM yyyy') : '');
  const formatTime = (d: Date | null) => {
    console.log(d)
    return (d && isValid(d) ? format(d, 'HH:mm') : '');
  };

  const OutlookLink = () => {
    const url = outlook({
      title: event?.name || 'Booking',
      start: startDate ?? new Date(),
      end: endDate ?? new Date(),
      description: event?.description || '',
      location: event?.facility?.name || '',
    });
    window.open(url, '_blank', 'noopener,noreferrer');
  };
  
  const status: statuses = event.status as statuses
  console.log(event)

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <Badge
          className="text-[10px] px-2 py-0.5 rounded-full font-medium"
          style={{
            backgroundColor: Colors[status] || Colors.default,
            color: '#ffffff',
            borderColor: Colors[status] || Colors.default,
          }}
        >
          {capitalize(status)}
        </Badge>
        {event.owner?.name && (
          <span className="text-xs text-muted-foreground">{event.owner?.name}</span>
        )}
      </div>

      <div className="text-xs">
        <span className="font-medium">{event?.name}</span>
      </div>

      <div className="text-xs text-muted-foreground">
        {formatDate(new Date(event.date))}
      </div>

      <div className="text-xs text-muted-foreground">
        {formatTime(startDate)} {' '}
        – {' '}
        {formatTime(endDate)}
      </div>

      <div className="flex items-center gap-2">
        <Button
          onClick={OutlookLink}
          variant="ghost"
          className="h-6 px-2 text-xs"
        >
          <Calendar className="h-3 w-3 mr-1" /> Add to Calendar
        </Button>
      </div>
    </div>
  )
}

export default EventItem;