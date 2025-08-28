import { z } from 'zod';
import { baseEntitySchema, timestampSchema } from '../types/base';

export const facilitySchema = z.object({
  name: z.string().nullable(),
  type: z.string().nullable(),
  building: z.number().nullable(),
  description: z.string().nullable(),
  amenities: z.array(z.string()).nullable(),
  capacity: z.number().nullable(),
  images: z.record(z.unknown()).nullable(),
});

export const facilityInputSchema = facilitySchema;
export const facilityUpdateSchema = facilitySchema.partial();
export const facilityWithTimestampsSchema = facilitySchema.merge(timestampSchema);
export const completeFacilitySchema = facilitySchema.merge(baseEntitySchema);

// Facility Type schemas
export const facilityTypeSchema = z.object({
  name: z.string(),
  description: z.string().nullable(),
});

export const facilityTypeInputSchema = facilityTypeSchema;
export const facilityTypeUpdateSchema = facilityTypeSchema.partial();
export const facilityTypeWithTimestampsSchema = facilityTypeSchema.merge(timestampSchema);
export const completeFacilityTypeSchema = facilityTypeSchema.merge(timestampSchema);

// Responsible Person schemas
export const responsiblePersonSchema = z.object({
  user: z.string().uuid(),
  facility: z.number(),
  name: z.string().nullable(),
  phone: z.string().nullable(),
  email: z.string().email().nullable(),
});

export const responsiblePersonInputSchema = responsiblePersonSchema;
export const responsiblePersonUpdateSchema = responsiblePersonSchema.partial();
export const responsiblePersonWithTimestampsSchema = responsiblePersonSchema.merge(timestampSchema);
export const completeResponsiblePersonSchema = responsiblePersonSchema.merge(baseEntitySchema);