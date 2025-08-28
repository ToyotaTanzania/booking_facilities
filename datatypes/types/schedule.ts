import { BaseEntity, CreateInput, UpdateInput, WithTimestamps, DbTimestamp } from './base';

export interface ScheduleData {
  name: string | null;
}

export type Schedule = ScheduleData & BaseEntity;
export type ScheduleInput = CreateInput<Schedule>;
export type ScheduleUpdate = UpdateInput<Schedule>;
export type ScheduleWithTimestamps = WithTimestamps<ScheduleData>;

export interface SlotData {
  start: string | null;
  end: string | null;
  schedule: number | null;  // References Schedule.id
  start_time: DbTimestamp | null;
  end_time: DbTimestamp | null;
  size: number | null;
}

export type Slot = SlotData & BaseEntity;
export type SlotInput = CreateInput<Slot>;
export type SlotUpdate = UpdateInput<Slot>;
export type SlotWithTimestamps = WithTimestamps<SlotData>;
