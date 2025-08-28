import { BaseEntity, CreateInput, UpdateInput, WithTimestamps } from './base';

export interface BuildingData {
  name: string | null;
  location: string | null;  // References Location.name
}

export type Building = BuildingData & BaseEntity;
export type BuildingInput = CreateInput<Building>;
export type BuildingUpdate = UpdateInput<Building>;
export type BuildingWithTimestamps = WithTimestamps<BuildingData>;
