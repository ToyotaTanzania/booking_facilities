"use client";

// import { useMediaQuery } from "@/hooks/use-mobile";
import { useMedia } from 'react-use';
import { BookingFilterMenu } from "./booking-filter-menu";
import { BookingFilterMenuDesktop } from "./booking-filter-menu-desktop";

interface BookingFilterMenuResponsiveProps {
  className?: string;
}

export function BookingFilterMenuResponsive({ className }: BookingFilterMenuResponsiveProps) {
  const isMobile = useMedia("(max-width: 768px)");

  if (isMobile) {
    return <BookingFilterMenu className={className} />;
  }

  return <BookingFilterMenuDesktop className={className} />;
}
