import { z } from 'zod';
import { baseEntitySchema, timestampSchema } from '../types/base';

export const locationSchema = z.object({
  name: z.string().min(1),
  address: z.string().nullable(),
});

export const locationInputSchema = locationSchema;
export const locationUpdateSchema = locationSchema.partial();
export const locationWithTimestampsSchema = locationSchema.merge(timestampSchema);
export const completeLocationSchema = locationSchema.merge(baseEntitySchema);
