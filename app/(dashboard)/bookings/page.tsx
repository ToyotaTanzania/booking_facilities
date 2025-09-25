import { auth } from "@/server/auth";
import { api } from "@/trpc/server";
// import { redirect } from "next/navigation";
import type { Session } from "next-auth";
import * as _ from "lodash";

export default async function BookingsPage() {

  const  rooms = await api.responsiblePerson.getMyRooms()

  return (
    <div>
      <div className="flex flex-col gap-4 pt-8">
        { 
            _.isEmpty(rooms) ? 
            (
            <div> 

            </div>
            ) :
            (<div> Responsible User </div>)
          }
      </div>
    </div>
  );
}