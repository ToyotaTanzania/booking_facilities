import type { TEventColor } from "@/calendar/types";

export interface ILocation {
  name: string;
  address: string;
}

export interface IBuilding {
  id: number;
  name: string;
  location: string | ILocation;
}

export interface ISchedule {
  id: number;
  name: string;
}

export interface ISlot {
  id: number;
  start: string;
  end: string;
  schedule: number | ISchedule;
  start_time: string;
  end_time: string;
  size: number;
}

export interface IFacilityType {
  name: string;
  description: string;
}

export interface IFacility {
  id: number;
  name: string;
  building: number | IBuilding;
  description: string;
  amenities: string[];
  capacity: number;
  images: any;
  type: string | IFacilityType;
  schedule: number | ISchedule;
}

export interface IProfiles { 
  userid: string;
  name: string;
  phone: string; 
  unit: string;
  segment: string;
  division: string;
  legal_entity: string;
  role: string;
  email: string;
  isActive: boolean;
}

export interface IUser extends IProfiles { 
  id: string;
  picturePath: string | null;
}

export interface IEvent {
  user: string | IProfiles;
  facility: number | IFacility;
  slot: number | ISlot;
  date: string | Date;
  schedule: number | ISchedule;
  created_at: string | Date;
  approved_at: string | Date | null;
  status : "pending" | "approved" | "rejected" | "confirmed" | "cancelled"; 
  description: string;
  approved_by: string | IProfiles | null;
  comment: string;
  start: string;
  end: string;

  // Optional fields used by calendar rendering
  id?: number | string;
  title?: string;
  color?: TEventColor | string;
  startDate?: string; // ISO datetime
  endDate?: string;   // ISO datetime
}

export interface ICalendarCell {
  day: number;
  currentMonth: boolean;
  date: Date;
}
