import { z } from "zod";

export const eventSchema = z.object({
  // user: z.string(),
  location: z.union([z.string(),z.number()]).optional(),
  building: z.union([z.string(),z.number()]).optional(),
  room: z.union([z.string(),z.number()],{ 
    required_error: "Room is required"
  }),
  date: z.any({ required_error: "Date is required" }),
  slots: z.array(z.string({ required_error: "At least one slot must be selected" })).min(1, "At least one slot must be selected"),
});

export type TEventFormData = z.infer<typeof eventSchema>;
