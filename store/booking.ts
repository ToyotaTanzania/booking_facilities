import { atom } from 'jotai';

export interface BookingFilters {
  date: string;
  location: string | null;
  building: string | null;
  facility: string | null;
}

// Default filters with current date
export const defaultBookingFilters: BookingFilters = {
  date: new Date().toISOString().split('T')[0], // Current date in YYYY-MM-DD format
  location: null,
  building: null,
  facility: null,
};

// Main booking filters atom
export const bookingFiltersAtom = atom<BookingFilters>(defaultBookingFilters);

// Individual filter atoms for fine-grained updates
export const bookingDateAtom = atom(
  (get) => get(bookingFiltersAtom).date,
  (get, set, newDate: string) => {
    const current = get(bookingFiltersAtom);
    set(bookingFiltersAtom, { ...current, date: newDate });
  }
);

export const bookingLocationAtom = atom(
  (get) => get(bookingFiltersAtom).location,
  (get, set, newLocation: string | null) => {
    const current = get(bookingFiltersAtom);
    set(bookingFiltersAtom, { 
      ...current, 
      location: newLocation,
      building: null, // Reset building when location changes
      facility: null  // Reset facility when location changes
    });
  }
);

export const bookingBuildingAtom = atom(
  (get) => get(bookingFiltersAtom).building,
  (get, set, newBuilding: string | null) => {
    const current = get(bookingFiltersAtom);
    set(bookingFiltersAtom, { 
      ...current, 
      building: newBuilding,
      facility: null  // Reset facility when building changes
    });
  }
);

export const bookingFacilityAtom = atom(
  (get) => get(bookingFiltersAtom).facility,
  (get, set, newFacility: string | null) => {
    const current = get(bookingFiltersAtom);
    set(bookingFiltersAtom, { ...current, facility: newFacility });
  }
);

// Reset filters atom
export const resetBookingFiltersAtom = atom(
  null,
  (get, set) => {
    set(bookingFiltersAtom, defaultBookingFilters);
  }
);
