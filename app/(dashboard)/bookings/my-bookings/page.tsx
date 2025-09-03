import { CalendarProvider } from "@/calendar/contexts/calendar-context";
import { getEvents, getUsers } from "@/calendar/requests";
import { ClientContainer } from "@/calendar/components/client-container";
import { BookingsCalendar } from "./calendar";

// Fetch your events and users data
const events = await getEvents();
const users = await getUsers();

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border h-screen ">
        <BookingsCalendar />
    </div>
  );
}
