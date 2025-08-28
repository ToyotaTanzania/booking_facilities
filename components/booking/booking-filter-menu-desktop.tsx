"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAtom } from "jotai";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Calendar, Filter, Search, X, RotateCcw } from "lucide-react";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import {
  bookingFiltersAtom,
  resetBookingFiltersAtom,
  type BookingFilters,
} from "@/store/booking";
import { bookingFiltersFormInputSchema, type BookingFiltersFormInputData } from "@/store/booking-schema";

interface BookingFilterMenuDesktopProps {
  className?: string;
}

export function BookingFilterMenuDesktop({ className }: BookingFilterMenuDesktopProps) {
  const [filters, setFilters] = useAtom(bookingFiltersAtom);
  const [, resetFilters] = useAtom(resetBookingFiltersAtom);

  // Fetch data for dropdowns
  const { data: locations } = api.location.list.useQuery();
  const { data: buildings } = api.building.list.useQuery();
  const { data: facilities } = api.facility.list.useQuery();

  // Filter buildings by selected location
  const filteredBuildings = buildings?.filter(
    (building) => !filters.location || building.location === filters.location
  ) || [];

  // Filter facilities by selected building
  const filteredFacilities = facilities?.filter(
    (facility) => !filters.building || facility.building.name === filters.building
  ) || [];

  const form = useForm<BookingFiltersFormInputData>({
    resolver: zodResolver(bookingFiltersFormInputSchema),
    defaultValues: {
      date: filters.date,
      location: filters.location || "all",
      building: filters.building || "all",
      facility: filters.facility || "all",
    },
  });

  const onSubmit = (data: BookingFiltersFormInputData) => {
    // Only update the date filter since location, building, and facility are auto-applied
    const newFilters = {
      ...filters,
      date: data.date,
    };
    setFilters(newFilters);
    toast.success("Date filter applied successfully");
  };

  const handleReset = () => {
    resetFilters();
    form.reset({
      date: new Date().toISOString().split('T')[0],
      location: "all",
      building: "all",
      facility: "all",
    });
    toast.success("Filters reset successfully");
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      date: new Date().toISOString().split('T')[0],
      location: null,
      building: null,
      facility: null,
    };
    setFilters(clearedFilters);
    form.reset({
      date: clearedFilters.date,
      location: "all",
      building: "all",
      facility: "all",
    });
    toast.success("Filters cleared successfully");
  };

  // Check if any filters are applied (excluding date)
  const hasActiveFilters = filters.location || filters.building || filters.facility;

  return (
    <div className={`bg-card border rounded-lg p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-5 w-5 text-muted-foreground" />
        <h3 className="font-medium">Booking Filters</h3>
        <span className="text-xs text-muted-foreground">(Location, building & facility auto-apply)</span>
        {hasActiveFilters && (
          <div className="h-2 w-2 rounded-full bg-blue-600" />
        )}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Date Filter */}
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4" />
                    Date
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Location Filter */}
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm">Location</FormLabel>
                  <Select
                    value={field.value || ""}
                    onValueChange={(value) => {
                      field.onChange(value);
                      // Auto-apply location change
                      const newFilters = {
                        ...filters,
                        location: value === "all" ? null : value,
                        building: null, // Reset building when location changes
                        facility: null, // Reset facility when location changes
                      };
                      setFilters(newFilters);
                      // Update form to reflect the reset values
                      form.setValue("building", "all");
                      form.setValue("facility", "all");
                    }}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="All Locations" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="all">All Locations</SelectItem>
                      {locations?.map((location) => (
                        <SelectItem key={location.name} value={location.name}>
                          {location.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Building Filter */}
            <FormField
              control={form.control}
              name="building"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm">Building</FormLabel>
                  <Select
                    value={field.value || ""}
                    onValueChange={(value) => {
                      field.onChange(value);
                      // Auto-apply building change
                      const newFilters = {
                        ...filters,
                        building: value === "all" ? null : value,
                        facility: null, // Reset facility when building changes
                      };
                      setFilters(newFilters);
                      // Update form to reflect the reset value
                      form.setValue("facility", "all");
                    }}
                    disabled={!filters.location}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={
                          filters.location ? "All Buildings" : "Select location first"
                        } />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="all">All Buildings</SelectItem>
                      {filteredBuildings.map((building) => (
                        <SelectItem key={building.name} value={building.name || ""}>
                          {building.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Facility Filter */}
            <FormField
              control={form.control}
              name="facility"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm">Facility</FormLabel>
                  <Select
                    value={field.value || ""}
                    onValueChange={(value) => {
                      field.onChange(value);
                      // Auto-apply facility change
                      const newFilters = {
                        ...filters,
                        facility: value === "all" ? null : value,
                      };
                      setFilters(newFilters);
                    }}
                    disabled={!filters.building}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={
                          filters.building ? "All Facilities" : "Select building first"
                        } />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="all">All Facilities</SelectItem>
                      {filteredFacilities.map((facility) => (
                        <SelectItem key={facility.name} value={facility.name || ""}>
                          {facility.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button type="submit" className="gap-2">
              <Search className="h-4 w-4" />
              Apply Date Filter
            </Button>
            
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClearFilters}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Clear
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                className="gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            </div>
          </div>
        </form>
      </Form>

      {/* Current Filters Display */}
      {hasActiveFilters && (
        <div className="mt-4 p-3 bg-muted rounded-lg">
          <h4 className="font-medium text-sm mb-2">Active Filters:</h4>
          <div className="flex flex-wrap gap-2">
            {filters.location && (
              <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md">
                Location: {filters.location}
              </span>
            )}
            {filters.building && (
              <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md">
                Building: {filters.building}
              </span>
            )}
            {filters.facility && (
              <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md">
                Facility: {filters.facility}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
