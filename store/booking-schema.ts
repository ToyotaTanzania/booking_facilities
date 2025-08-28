import { z } from 'zod';

export const bookingFiltersSchema = z.object({
  date: z.string().min(1, "Date is required"),
  location: z.string().nullable(),
  building: z.string().nullable(),
  facility: z.string().nullable(),
});

export type BookingFiltersFormData = z.infer<typeof bookingFiltersSchema>;

// Validation schema for form submission
export const bookingFiltersFormSchema = z.object({
  date: z.string().min(1, "Date is required"),
  location: z.string().nullable(),
  building: z.string().nullable(),
  facility: z.string().nullable(),
});

// Schema for form data that includes "all" as a valid value
export const bookingFiltersFormInputSchema = z.object({
  date: z.string().min(1, "Date is required"),
  location: z.string(), // Can be "all" or actual location name
  building: z.string(), // Can be "all" or actual building name
  facility: z.string(), // Can be "all" or actual facility name
});

export type BookingFiltersFormInputData = z.infer<typeof bookingFiltersFormInputSchema>;

// Default form values
export const defaultBookingFiltersFormData: BookingFiltersFormData = {
  date: new Date().toISOString().split('T')[0],
  location: null,
  building: null,
  facility: null,
};

// Default form input values (including "all" options)
export const defaultBookingFiltersFormInputData: BookingFiltersFormInputData = {
  date: new Date().toISOString().split('T')[0],
  location: "all",
  building: "all",
  facility: "all",
};
