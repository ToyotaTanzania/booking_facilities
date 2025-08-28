import { BaseEntity, CreateInput, UpdateInput, WithTimestamps, DbTimestamp, DbDate } from './base';

export interface BookingData {
  schedule: number;  // References Schedule.id
  status: string | null;
  approved_at: DbTimestamp | null;
  slot: number;  // References Slot.id
  description: string | null;
  approved_by: string | null;  // UUID from auth.users
  facility: number;  // References Facility.id
  date: DbDate;
  user: string;  // UUID from auth.users
}

// Note: Booking has a composite primary key (schedule, slot, facility, date, user)
export type Booking = Omit<BookingData & BaseEntity, 'id'>;
export type BookingInput = BookingData;
export type BookingUpdate = Partial<BookingData>;
export type BookingWithTimestamps = WithTimestamps<BookingData>;

export interface BookingSlotData {
  date: DbDate;
  slot: number;  // References Slot.id
  status: number | null;
  active: boolean | null;
  schedule: number;  // References Schedule.id
  facility: number;  // References Facility.id
}

// Note: BookingSlot has a composite primary key (date, slot, schedule, facility)
export type BookingSlot = BookingSlotData;
export type BookingSlotInput = BookingSlotData;
export type BookingSlotUpdate = Partial<BookingSlotData>;