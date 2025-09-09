import { z } from "zod";

export const eventSchema = z.object({
  // user: z.string(),
  room: z.string().min(1, "Title is required"),
  date: z.date({ required_error: "Start date is required" }),
  slots: z.array(z.string({ required_error: "At least one slot must be selected" })).min(1, "At least one slot must be selected"),
});

export type TEventFormData = z.infer<typeof eventSchema>;
