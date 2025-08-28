"use client";

import { useBookingFilters } from "@/store/use-booking-filters";
import { BookingFilterMenuResponsive } from "./booking-filter-menu-responsive";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Building, Home } from "lucide-react";

interface BookingListWithFiltersProps {
  className?: string;
}

export function BookingListWithFilters({ className }: BookingListWithFiltersProps) {
  const {
    filters,
    hasActiveFilters,
    clearFilters,
    getFilterSummary,
  } = useBookingFilters();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Filter Menu */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Bookings</h2>
          <p className="text-muted-foreground">
            Manage and view facility bookings
          </p>
        </div>
        <BookingFilterMenuResponsive />
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="bg-muted/50 border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-sm">Active Filters</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-8 px-2 text-xs"
            >
              Clear All
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {getFilterSummary().map((filter, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {filter}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Filter Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <span className="font-medium">Date</span>
          </div>
          <p className="text-2xl font-bold mt-2">
            {new Date(filters.date).toLocaleDateString()}
          </p>
        </div>

        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-green-600" />
            <span className="font-medium">Location</span>
          </div>
          <p className="text-2xl font-bold mt-2">
            {filters.location || "All"}
          </p>
        </div>

        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Building className="h-5 w-5 text-purple-600" />
            <span className="font-medium">Building</span>
          </div>
          <p className="text-2xl font-bold mt-2">
            {filters.building || "All"}
          </p>
        </div>

        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Home className="h-5 w-5 text-orange-600" />
            <span className="font-medium">Facility</span>
          </div>
          <p className="text-2xl font-bold mt-2">
            {filters.facility || "All"}
          </p>
        </div>
      </div>

      {/* Placeholder for Booking List */}
      <div className="bg-card border rounded-lg p-8 text-center">
        <div className="text-muted-foreground">
          <p className="text-lg font-medium mb-2">Booking List</p>
          <p className="text-sm">
            This is where your filtered booking list would be displayed.
          </p>
          <p className="text-xs mt-2">
            Use the filters above to narrow down your search.
          </p>
        </div>
      </div>
    </div>
  );
}
