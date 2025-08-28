import type { BaseEntity, CreateInput, UpdateInput, WithTimestamps, DbJson } from './base';

export interface FacilityData {
  name: string | null;
  type: string | null;
  building: number | null;  // References Building.id
  description: string | null;
  amenities: string[] | null;
  capacity: number | null;
  images: DbJson | null;
}

export type Facility = FacilityData & BaseEntity;
export type FacilityInput = CreateInput<Facility>;
export type FacilityUpdate = UpdateInput<Facility>;
export type FacilityWithTimestamps = WithTimestamps<FacilityData>;

// Facility Type
export interface FacilityTypeData {
  name: string;
  description: string | null;
}

export type FacilityType = FacilityTypeData & WithTimestamps<FacilityTypeData>;
export type FacilityTypeInput = CreateInput<FacilityType>;
export type FacilityTypeUpdate = UpdateInput<FacilityType>;
export type FacilityTypeWithTimestamps = WithTimestamps<FacilityTypeData>;

// Responsible Person relationship
export interface ResponsiblePersonData {
  user: string;  // UUID from auth.users
  facility: number;  // References Facility.id
  name: string | null;
  phone: string | null;
  email: string | null;
}

export type ResponsiblePerson = ResponsiblePersonData & BaseEntity;
export type ResponsiblePersonInput = CreateInput<ResponsiblePerson>;
export type ResponsiblePersonUpdate = UpdateInput<ResponsiblePerson>;