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
import _ from "lodash";

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
    (building) => !filters.location || building.location.id === filters.location.id
  ) || [];

  // Filter facilities by selected building
  const filteredFacilities = facilities?.filter(
    (facility) => !filters.building || facility.building.id === filters.building.id
  ) || [];

  const form = useForm<BookingFiltersFormInputData>({
    resolver: zodResolver(bookingFiltersFormInputSchema),
    defaultValues: {
      date: filters.date,
      location: filters.location?.name || "all",
      building: filters.building?.name || "all",
      facility: filters.facility || "all",
    },
  });

  const onSubmit = (data: BookingFiltersFormInputData) => {
    // All filters are now auto-applied, so we can just show a success message
    toast.success("All filters applied successfully");
  };

  const handleReset = () => {
    resetFilters();
    form.reset({
      date: new Date().toISOString().split('T')[0],
      location: {
        id: 0,
        name: "",
      },
      building: null,
      facility: {
        id: 0,
        name: "",
      },
    });
    toast.success("Filters reset successfully");
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      date: new Date().toISOString().split('T')[0],
      location: {
        id: 0,
        name: "",
      },
      building: null,
      facility: null,
    };
    setFilters(clearedFilters);
    form.reset({
      date: clearedFilters.date,
      location: {
        id: 0,
        name: "",
      },
      building: {
        id: 0,
        name: "",
      },
      facility: "all",
    });
    toast.success("Filters cleared successfully");
  };

  // Check if any filters are applied (excluding date)
  const hasActiveFilters = filters.location?.id || filters.building?.id || filters.facility?.id;

  return (
    <div className={`bg-card border rounded-lg p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-5 w-5 text-muted-foreground" />
        <h3 className="font-medium">Booking Filters</h3>
        <span className="text-xs text-muted-foreground">(All filters auto-apply)</span>
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
                      onChange={(e) => {
                        const newDate = e.target.value;
                        field.onChange(newDate);
                        // Auto-apply date change
                        const newFilters = {
                          ...filters,
                          date: newDate,
                        };
                        setFilters(newFilters);
                      }}
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
                        location: value === "all" ? null : {
                          id: 0,
                          name: value,
                        },
                        building: null, // Reset building when location changes
                        facility: null, // Reset facility when location changes
                      };
                      setFilters(newFilters);
                      // Update form to reflect the reset values
                      form.setValue("building", {
                        id: 0,
                        name: "",
                      });
                      form.setValue("facility", "all");
                    }}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="All Locations" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="all">All Locations</SelectItem>
                      {locations?.map((location) => (
                        <SelectItem key={location.name} value={location.name}>
                          {_.capitalize(location.name)}
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
                        building: value === "all" ? null : {
                          id: 0,
                          name: value,
                        },
                        facility: null, // Reset facility when building changes
                      };
                      setFilters(newFilters);
                      // Update form to reflect the reset value
                      form.setValue("facility", {
                        id: 0,
                        name: "",
                      });
                    }}
                    disabled={!filters.location}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={
                          filters.location ? "All Buildings" : "Select location first"
                        } />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="all">All Buildings</SelectItem>
                      {filteredBuildings.map((building) => (
                        <SelectItem key={building.name} value={building.name || ""}>
                          {_.capitalize(building.name)}
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
                        facility: value === "all" ? null : {
                          id: 0,
                          name: value,
                        },
                      };
                      setFilters(newFilters);
                    }}
                    disabled={!filters.building}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full"> 
                        <SelectValue placeholder={
                          filters.building ? "All Facilities" : "Select building first"
                        } />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="all">All Facilities</SelectItem>
                      {filteredFacilities.map((facility) => (
                        <SelectItem key={facility.name} value={facility.id}>
                          {_.capitalize(facility.name)}
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
              Done
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
