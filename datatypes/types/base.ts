import { z } from 'zod';

export type Timestamp = {
  created_at: Date;
  updated_at?: Date;
};

export type BaseEntity = {
  id: number;
} & Timestamp;

export type WithTimestamps<T> = T & Timestamp;
export type WithId<T> = T & { id: number };
export type Complete<T> = T & BaseEntity;

// Common Zod schemas
export const timestampSchema = z.object({
  created_at: z.date(),
  updated_at: z.date().optional(),
});

export const baseEntitySchema = timestampSchema.extend({
  id: z.number(),
});

// Utility types for database operations
export type CreateInput<T> = Omit<T, keyof BaseEntity>;
export type UpdateInput<T> = Partial<CreateInput<T>>;

// Common database column types
export type DbTimestamp = string;
export type DbDate = string;
export type DbJson = Record<string, unknown>;
export type DbUuid = string;