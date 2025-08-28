import { BaseEntity, CreateInput, UpdateInput, WithTimestamps } from './base';

export interface LocationData {
  name: string;
  address: string | null;
}

export type Location = LocationData & BaseEntity;
export type LocationInput = CreateInput<Location>;
export type LocationUpdate = UpdateInput<Location>;
export type LocationWithTimestamps = WithTimestamps<LocationData>;
