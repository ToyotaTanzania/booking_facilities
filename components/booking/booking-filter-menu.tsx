"use client";

import React, { useState, useEffect } from "react";
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
import { MiniCalendar, MiniCalendarNavigation, MiniCalendarDays, MiniCalendarDay } from "@/components/ui/mini-calendar";
import { format, parseISO } from "date-fns";
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
      location: filters.location?.name ?? "all",
      building: filters.building?.name ?? "all",
      facility: filters.facility?.name ?? "all",
    },
  });

  // Update form when filters change
  const updateFormValues = (newFilters: BookingFilters) => {
    form.reset({
      date: newFilters.date,
      location: newFilters.location?.name ?? "all",
      building: newFilters.building?.name ?? "all",
      facility: newFilters.facility?.name ?? "all",
    });
  };

  // Update form values when filters change externally
  useEffect(() => {
    updateFormValues(filters);
  }, [filters]);

  const onSubmit = (data: BookingFiltersFormInputData) => {
    // All filters are now auto-applied, so we can just close the modal
    toast.success("All filters applied successfully");
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
  const hasActiveFilters = filters.location?.id || filters.building?.id || filters.facility?.id;

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
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto px-4">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Booking Filters
          </SheetTitle>
          <SheetDescription>
            All filters are applied automatically when changed. No need to click submit.
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
                      <MiniCalendar
                        value={field.value ? parseISO(field.value) : undefined}
                        onValueChange={(d) => {
                          const newDate = d ? format(d, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd");
                          field.onChange(newDate);
                          const newFilters: BookingFilters = {
                            ...filters,
                            date: newDate,
                          };
                          setFilters(newFilters);
                        }}
                        days={7}
                        className="justify-between"
                      >
                        <MiniCalendarNavigation direction="prev" />
                        <MiniCalendarDays>
                          {(date) => <MiniCalendarDay date={date} />}
                        </MiniCalendarDays>
                        <MiniCalendarNavigation direction="next" />
                      </MiniCalendar>
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
                      value={field.value || "all"}
                      onValueChange={(value) => {
                        field.onChange(value);
                        // Auto-apply location change
                        const selected = locations?.find((loc) => loc.name === value);
                        const newFilters: BookingFilters = {
                          ...filters,
                          location: value === "all" ? null : (selected ? { id: selected.id, name: selected.name } : { id: 0, name: value }),
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
                        <SelectTrigger className="w-full">
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
                      value={field.value || "all"}
                      onValueChange={(value) => {
                        field.onChange(value);
                        // Auto-apply building change
                        const selected = filteredBuildings.find((building) => building.name === value);
                        const newFilters: BookingFilters = {
                          ...filters,
                          building: value === "all" ? null : (selected ? { id: selected.id, name: selected.name } : { id: 0, name: value }),
                          facility: null, // Reset facility when building changes
                        };
                        setFilters(newFilters);
                        // Update form to reflect the reset value
                        form.setValue("facility", "all");
                      }}
                      disabled={!filters.location?.id}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={
                            filters.location?.id ? "Select a building" : "Select location first"
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
                      value={field.value || "all"}
                      onValueChange={(value) => {
                        field.onChange(value);
                        // Auto-apply facility change
                        const selected = filteredFacilities.find((facility) => facility.name === value);
                        const newFilters: BookingFilters = {
                          ...filters,
                          facility: value === "all" ? null : (selected ? { id: selected.id, name: selected.name } : { id: 0, name: value }),
                        };
                        setFilters(newFilters);
                      }}
                      disabled={!filters.building?.id}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={
                            filters.building?.id ? "Select a facility" : "Select building first"
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
                  Done
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
                <div>Location: {filters.location.name}</div>
              )}
              {filters.building && (
                <div>Building: {filters.building.name}</div>
              )}
              {filters.facility && (
                <div>Facility: {filters.facility.name}</div>
              )}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
