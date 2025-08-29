import { BookingsList } from "./components";
import { BookingPreview } from "./components/preview";

export default function BookingsPage() {
  return (
    <div>
      <BookingsList />
      <div className="flex flex-col gap-4 pt-8">
        <BookingPreview />
      </div>
    </div>
  );
}