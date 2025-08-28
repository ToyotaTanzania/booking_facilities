import { z } from 'zod';
import { baseEntitySchema, timestampSchema } from '../types/base';

export const scheduleSchema = z.object({
  name: z.string().nullable(),
});

export const scheduleInputSchema = scheduleSchema;
export const scheduleUpdateSchema = scheduleSchema.partial();
export const scheduleWithTimestampsSchema = scheduleSchema.merge(timestampSchema);
export const completeScheduleSchema = scheduleSchema.merge(baseEntitySchema);

export const slotSchema = z.object({
  start: z.string().nullable(),
  end: z.string().nullable(),
  schedule: z.number().nullable(),
  start_time: z.string().nullable(),
  end_time: z.string().nullable(),
  size: z.number().nullable(),
});

export const slotInputSchema = slotSchema;
export const slotUpdateSchema = slotSchema.partial();
export const slotWithTimestampsSchema = slotSchema.merge(timestampSchema);
export const completeSlotSchema = slotSchema.merge(baseEntitySchema);
