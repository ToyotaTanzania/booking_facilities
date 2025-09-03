import type { TEventColor } from "@/calendar/types";

export interface ILocation {
  name: string;
  address: string;
}

export interface IBuilding {
  id: number;
  name: string;
}

export interface IFacilityType {
  id: number;
  name: string;
}

export interface IFacility {
  id: number;
  startDate: string;
  endDate: string;
  title: string;
  color: TEventColor;
}

export interface IUser {
  id: string;
  name: string;
  picturePath: string | null;
}

export interface IEvent {
  id: number;
  startDate: string;
  endDate: string;
  title: string;
  color: TEventColor;
  description: string;
  user: IUser;

  
}

export interface ICalendarCell {
  day: number;
  currentMonth: boolean;
  date: Date;
}
