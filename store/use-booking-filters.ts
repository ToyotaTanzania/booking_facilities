import { useAtom } from "jotai";
import {
  bookingFiltersAtom,
  bookingDateAtom,
  bookingLocationAtom,
  bookingBuildingAtom,
  bookingFacilityAtom,
  resetBookingFiltersAtom,
  type BookingFilters,
} from "./booking";

export function useBookingFilters() {
  const [filters, setFilters] = useAtom(bookingFiltersAtom);
  const [date, setDate] = useAtom(bookingDateAtom);
  const [location, setLocation] = useAtom(bookingLocationAtom);
  const [building, setBuilding] = useAtom(bookingBuildingAtom);
  const [facility, setFacility] = useAtom(bookingFacilityAtom);
  const [, resetFilters] = useAtom(resetBookingFiltersAtom);

  const updateFilters = (newFilters: Partial<BookingFilters>) => {
    setFilters({ ...filters, ...newFilters });
  };

  const clearFilters = () => {
    const clearedFilters = {
      date: new Date().toISOString().split('T')[0],
      location: null,
      building: null,
      facility: null,
    };
    setFilters(clearedFilters);
  };

  const hasActiveFilters = filters.location || filters.building || filters.facility;

  return {
    // Current filter values
    filters,
    date,
    location,
    building,
    facility,
    
    // Actions
    setFilters,
    setDate,
    setLocation,
    setBuilding,
    setFacility,
    updateFilters,
    clearFilters,
    resetFilters,
    
    // Computed values
    hasActiveFilters,
    
    // Helper functions
    getFilterSummary: () => {
      const summary = [];
      if (filters.location) summary.push(`Location: ${filters.location}`);
      if (filters.building) summary.push(`Building: ${filters.building}`);
      if (filters.facility) summary.push(`Facility: ${filters.facility}`);
      return summary;
    },
  };
}
