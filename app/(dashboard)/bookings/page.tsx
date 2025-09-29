import { auth } from "@/server/auth";
import { api } from "@/trpc/server";
// import { redirect } from "next/navigation";
import { GetMyBookings } from "./components/bookings";
import type { Session } from "next-auth";
import * as _ from "lodash";
import { GetResponsibleRooms } from "./components/responsibleBooking";

export default async function BookingsPage() {

  const  rooms = await api.responsiblePerson.getMyRooms()

  return (
    <div>
      <div className="flex flex-col gap-4 pt-8">
        { 
            _.isEmpty(rooms) ? 
            (
              <div> 
                <GetMyBookings />
              </div>
            ) :
            (
              <div>
                <GetResponsibleRooms />
              </div>
            )
          }
      </div>
    </div>
  );
}