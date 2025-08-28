import { z } from 'zod';
import { baseEntitySchema, timestampSchema } from '../types/base';

export const buildingSchema = z.object({
  name: z.string().nullable(),
  location: z.string().nullable(),
});

export const buildingInputSchema = buildingSchema;
export const buildingUpdateSchema = buildingSchema.partial();
export const buildingWithTimestampsSchema = buildingSchema.merge(timestampSchema);
export const completeBuildingSchema = buildingSchema.merge(baseEntitySchema);
