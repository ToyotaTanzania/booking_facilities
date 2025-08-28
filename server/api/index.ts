
import { createCallerFactory, createTRPCRouter } from "@/server";
import { userRouter } from "./routers/auth/user";
import { bookingRouter } from "./routers/booking";
import { buildingRouter } from "./routers/building";
import { facilityRouter } from "./routers/facility";
import { facilityTypeRouter } from "./routers/facility-type";
import { locationRouter } from "./routers/location";
import { responsiblePersonRouter } from "./routers/responsible-person";
import { scheduleRouter } from "./routers/schedule";
import { slotsRouter } from "./routers/slots";
/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  location: locationRouter,
  building: buildingRouter,
  facility: facilityRouter,
  facilityType: facilityTypeRouter,
  responsiblePerson: responsiblePersonRouter,
  schedule: scheduleRouter,
  slots: slotsRouter,
  booking: bookingRouter,
  user: userRouter,
  auth: { 
    users: userRouter
  }
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
