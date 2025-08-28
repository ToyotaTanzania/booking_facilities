import { z } from 'zod';
import { timestampSchema } from '../types/base';

export const bookingSchema = z.object({
  schedule: z.number(),
  status: z.string().nullable(),
  approved_at: z.string().nullable(),
  slot: z.number(),
  description: z.string().nullable(),
  approved_by: z.string().uuid().nullable(),
  facility: z.number(),
  date: z.string(),
  user: z.string().uuid(),
});

export const bookingInputSchema = bookingSchema;
export const bookingUpdateSchema = bookingSchema.partial();
export const bookingWithTimestampsSchema = bookingSchema.merge(timestampSchema);

// Note: No complete schema with id since Booking uses composite primary key

export const bookingSlotSchema = z.object({
  date: z.string(),
  slot: z.number(),
  status: z.number().nullable(),
  active: z.boolean().nullable().default(true),
  schedule: z.number(),
  facility: z.number(),
});

export const bookingSlotInputSchema = bookingSlotSchema;
export const bookingSlotUpdateSchema = bookingSlotSchema.partial();

// Note: No timestamps or complete schema since BookingSlot uses composite primary key