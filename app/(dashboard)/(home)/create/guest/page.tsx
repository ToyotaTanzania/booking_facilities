
import { Navigation } from "../../../bookings/navigation";
import { GuestBookingForm } from "./_components/form";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border h-screen ">
        <Navigation />
        <div className="p-6">
            <GuestBookingForm />
        </div>
    </div>
  );
}
