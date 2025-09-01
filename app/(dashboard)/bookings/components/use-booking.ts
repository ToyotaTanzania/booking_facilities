import { useState } from "react";
import { toast } from "sonner";

interface BookingRequest {
  slotId: number;
  start: string;
  end: string;
  size: number;
  date: string;
  facilityId?: number;
  userId?: string;
}

interface UseBookingReturn {
  isBooking: boolean;
  selectedSlots: Set<number>;
  selectSlot: (slotId: number, checked: boolean) => void;
  clearSelection: () => void;
  confirmBooking: (slots: any[], date: string, facilityId?: number) => Promise<boolean>;
}

export function useBooking(): UseBookingReturn {
  const [isBooking, setIsBooking] = useState(false);
  const [selectedSlots, setSelectedSlots] = useState<Set<number>>(new Set());

  const selectSlot = (slotId: number, checked: boolean) => {
    const newSelectedSlots = new Set(selectedSlots);
    if (checked) {
      newSelectedSlots.add(slotId);
    } else {
      newSelectedSlots.delete(slotId);
    }
    setSelectedSlots(newSelectedSlots);
  };

  const clearSelection = () => {
    setSelectedSlots(new Set());
  };

  const confirmBooking = async (
    slots: any[], 
    date: string, 
    facilityId?: number
  ): Promise<boolean> => {
    if (slots.length === 0) {
      toast.error("No slots selected");
      return false;
    }

    setIsBooking(true);
    
    try {
      // TODO: Replace with your actual API endpoint
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slots: slots.map(slot => ({
            slotId: slot.id,
            start: slot.start,
            end: slot.end,
            size: slot.size,
            date,
            facilityId,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create booking');
      }

      const result = await response.json();
      
      toast.success(`Successfully booked ${slots.length} slot(s)`);
      clearSelection();
      
      return true;
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error('Failed to create booking. Please try again.');
      return false;
    } finally {
      setIsBooking(false);
    }
  };

  return {
    isBooking,
    selectedSlots,
    selectSlot,
    clearSelection,
    confirmBooking,
  };
}
