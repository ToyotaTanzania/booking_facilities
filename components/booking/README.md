# Booking Filter Components

This folder contains a comprehensive set of components for filtering bookings using Jotai atoms, shadcn forms, and Zod validation.

## Components

### 1. `BookingFilterMenu` (Mobile)
- **Purpose**: Mobile-first filter menu that opens as a slide-out sheet
- **Features**: 
  - Date picker with current date as default
  - Location dropdown (fetches from database)
  - Building dropdown (filtered by selected location)
  - Facility dropdown (filtered by selected building)
  - Form validation with Zod
  - Toast notifications for user feedback

### 2. `BookingFilterMenuDesktop` (Desktop)
- **Purpose**: Inline filter form for larger screens
- **Features**:
  - Same functionality as mobile version
  - Grid layout for better space utilization
  - Active filters display with badges
  - Responsive button layout

### 3. `BookingFilterMenuResponsive` (Wrapper)
- **Purpose**: Automatically switches between mobile and desktop versions
- **Features**:
  - Uses `useMediaQuery` hook to detect screen size
  - Breakpoint at 768px (md)

### 4. `BookingListWithFilters` (Example)
- **Purpose**: Example component showing how to integrate filters
- **Features**:
  - Filter summary cards
  - Active filters display
  - Clear all filters functionality

## Store (Jotai Atoms)

### `store/booking.ts`
- **`bookingFiltersAtom`**: Main atom containing all filter values
- **`bookingDateAtom`**: Individual atom for date
- **`bookingLocationAtom`**: Individual atom for location (resets building/facility)
- **`bookingBuildingAtom`**: Individual atom for building (resets facility)
- **`bookingFacilityAtom`**: Individual atom for facility
- **`resetBookingFiltersAtom`**: Action atom to reset all filters

### `store/booking-schema.ts`
- **`bookingFiltersSchema`**: Zod schema for validation
- **`BookingFiltersFormData`**: TypeScript type for form data

### `store/use-booking-filters.ts`
- **Custom hook** providing easy access to all filter functionality
- **Helper functions** for common operations

## Usage

### Basic Implementation

```tsx
import { BookingFilterMenuResponsive } from "@/components/booking";
import { useBookingFilters } from "@/store/use-booking-filters";

function MyBookingPage() {
  const { filters, hasActiveFilters } = useBookingFilters();

  return (
    <div>
      <BookingFilterMenuResponsive />
      {/* Your booking list component */}
    </div>
  );
}
```

### Advanced Usage

```tsx
import { useBookingFilters } from "@/store/use-booking-filters";

function MyComponent() {
  const {
    filters,
    setFilters,
    updateFilters,
    clearFilters,
    resetFilters,
    hasActiveFilters,
    getFilterSummary,
  } = useBookingFilters();

  // Update specific filters
  const handleLocationChange = (location: string) => {
    updateFilters({ location });
  };

  // Clear all filters
  const handleClearAll = () => {
    clearFilters();
  };

  // Reset to defaults
  const handleReset = () => {
    resetFilters();
  };

  return (
    <div>
      {/* Your component content */}
    </div>
  );
}
```

## Features

### ✅ **Form Validation**
- Zod schema validation
- Required field validation
- Proper error messages

### ✅ **Responsive Design**
- Mobile-first approach
- Sheet component for mobile
- Inline form for desktop
- Automatic responsive switching

### ✅ **State Management**
- Jotai atoms for global state
- Automatic cascading resets
- Persistent filter state

### ✅ **Database Integration**
- Fetches locations from database
- Filters buildings by location
- Filters facilities by building
- Real-time data updates

### ✅ **User Experience**
- Current date as default
- Visual indicators for active filters
- Toast notifications
- Clear and reset functionality
- Active filters summary

### ✅ **Accessibility**
- Proper form labels
- ARIA-compliant components
- Keyboard navigation support

## Dependencies

- **Jotai**: State management
- **React Hook Form**: Form handling
- **Zod**: Schema validation
- **shadcn/ui**: UI components
- **Lucide React**: Icons
- **Sonner**: Toast notifications

## File Structure

```
components/booking/
├── booking-filter-menu.tsx          # Mobile filter menu
├── booking-filter-menu-desktop.tsx  # Desktop filter menu
├── booking-filter-menu-responsive.tsx # Responsive wrapper
├── booking-list-with-filters.tsx    # Example usage
├── index.ts                         # Exports
└── README.md                        # This file

store/
├── booking.ts                       # Jotai atoms
├── booking-schema.ts                # Zod schemas
└── use-booking-filters.ts           # Custom hook
```

## Customization

### Adding New Filters
1. Update the `BookingFilters` interface in `store/booking.ts`
2. Add new atoms for the filter
3. Update the Zod schema in `store/booking-schema.ts`
4. Add form fields to both mobile and desktop components

### Styling
- Components use Tailwind CSS classes
- Follow shadcn/ui design patterns
- Easily customizable through className props

### Validation Rules
- Modify Zod schemas in `store/booking-schema.ts`
- Add custom validation logic as needed
- Update error messages and validation rules
