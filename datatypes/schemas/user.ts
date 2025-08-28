import { z } from 'zod';

export const userRoleEnum = z.enum(['admin', 'user']);
export const userStatusEnum = z.enum(['active', 'inactive', 'suspended']);

export const userSchema = z.object({
  email: z.string().email(),
  name: z.string().nullable(),
  role: userRoleEnum,
  status: userStatusEnum,
  avatar_url: z.string().url().nullable(),
  phone: z.string().nullable(),
  department: z.string().nullable(),
});

export const userProfileSchema = z.object({
  created_at: z.string(),
  userid: z.string().uuid(),
  name: z.string().min(1, "Name is required"),
  phone: z.string().nullable(),
  unit: z.string().nullable(),
  segment: z.string().nullable(),
  division: z.string().nullable(),
  legal_entity: z.string().nullable(),
  isActive: z.boolean().default(true),
  role: z.string().nullable(),
});

export const createUserSchema = userSchema;

export const updateUserSchema = userSchema.partial();

export const createUserProfileSchema = userProfileSchema.omit({ created_at: true });

export const updateUserProfileSchema = createUserProfileSchema.partial();

export const userWithTimestampsSchema = userSchema.extend({
  created_at: z.date(),
  updated_at: z.date(),
});

export const completeUserSchema = userWithTimestampsSchema.extend({
  id: z.string().uuid(),
});
