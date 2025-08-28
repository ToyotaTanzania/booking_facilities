"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAtom } from "jotai";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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
import { Calendar, Filter, Search, X } from "lucide-react";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import {
  bookingFiltersAtom,
  resetBookingFiltersAtom,
  type BookingFilters,
} from "@/store/booking";
import { bookingFiltersFormInputSchema, type BookingFiltersFormInputData } from "@/store/booking-schema";
import _ from "lodash";

interface BookingFilterMenuProps {
  className?: string;
}

export function BookingFilterMenu({ className }: BookingFilterMenuProps) {
  const [open, setOpen] = useState(false);
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

  // Update form when filters change
  const updateFormValues = (newFilters: BookingFilters) => {
    form.reset({
      date: newFilters.date,
      location: newFilters.location || "all",
      building: newFilters.building || "all",
      facility: newFilters.facility || "all",
    });
  };

  const onSubmit = (data: BookingFiltersFormInputData) => {
    // Only update the date filter since location, building, and facility are auto-applied
    const newFilters = {
      ...filters,
      date: data.date,
    };
    setFilters(newFilters);
    toast.success("Date filter applied successfully");
    setOpen(false);
  };

  const handleReset = () => {
    resetFilters();
    updateFormValues({
      date: new Date().toISOString().split('T')[0],
      location: null,
      building: null,
      facility: null,
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
    updateFormValues(clearedFilters);
    toast.success("Filters cleared successfully");
  };

  // Check if any filters are applied (excluding date)
  const hasActiveFilters = filters.location || filters.building || filters.facility;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`gap-2 ${className}`}
        >
          <Filter className="h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <div className="h-2 w-2 rounded-full bg-blue-600" />
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Booking Filters
          </SheetTitle>
          <SheetDescription>
            Location, building, and facility filters are applied automatically. Only the date filter needs to be submitted.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Date Filter */}
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
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
                    <FormLabel>Location</FormLabel>
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
                          <SelectValue placeholder="Select a location" />
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
                    <FormLabel>Building</FormLabel>
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
                            filters.location ? "Select a building" : "Select location first"
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
                    <FormLabel>Facility</FormLabel>
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
                            filters.building ? "Select a facility" : "Select building first"
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

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 pt-4">
                <Button type="submit" className="w-full gap-2">
                  <Search className="h-4 w-4" />
                  Apply Date Filter
                </Button>
                
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClearFilters}
                    className="flex-1 gap-2"
                  >
                    <X className="h-4 w-4" />
                    Clear
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleReset}
                    className="flex-1 gap-2"
                  >
                    Reset
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </div>

        {/* Current Filters Display */}
        {hasActiveFilters && (
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h4 className="font-medium text-sm mb-2">Active Filters:</h4>
            <div className="space-y-1 text-sm text-muted-foreground">
              {filters.location && (
                <div>Location: {filters.location}</div>
              )}
              {filters.building && (
                <div>Building: {filters.building}</div>
              )}
              {filters.facility && (
                <div>Facility: {filters.facility}</div>
              )}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
