"use client";

import { DailyCalendar } from "./calendar";

// Sample data as provided
const sampleSlots = [
  {
    "id": 10,
    "end": "07:30",
    "size": 1,
    "start": "07:00",
    "end_time": "2025-08-25T07:30:00",
    "schedule": 1,
    "created_at": "2025-08-25T06:38:58.256721+00:00",
    "start_time": "2025-08-25T07:00:00"
  },
  {
    "id": 11,
    "end": "08:00",
    "size": 1,
    "start": "07:30",
    "end_time": "2025-08-25T08:00:00",
    "schedule": 1,
    "created_at": "2025-08-25T06:38:58.256721+00:00",
    "start_time": "2025-08-25T07:30:00"
  },
  {
    "id": 12,
    "end": "08:30",
    "size": 1,
    "start": "08:00",
    "end_time": "2025-08-25T08:30:00",
    "schedule": 1,
    "created_at": "2025-08-25T06:38:58.256721+00:00",
    "start_time": "2025-08-25T08:00:00"
  },
  {
    "id": 13,
    "end": "09:00",
    "size": 1,
    "start": "08:30",
    "end_time": "2025-08-25T09:00:00",
    "schedule": 1,
    "created_at": "2025-08-25T06:38:58.256721+00:00",
    "start_time": "2025-08-25T08:30:00"
  },
  {
    "id": 14,
    "end": "09:30",
    "size": 1,
    "start": "09:00",
    "end_time": "2025-08-25T09:30:00",
    "schedule": 1,
    "created_at": "2025-08-25T06:38:58.256721+00:00",
    "start_time": "2025-08-25T09:00:00"
  }
];

// Sample booking data with different statuses
const sampleBookings = [
  {
    id: 1,
    start: "07:00",
    end: "07:30",
    size: 1,
    status: "pending" as const,
    user_id: "user1"
  },
  {
    id: 2,
    start: "07:30",
    end: "08:00",
    size: 1,
    status: "rejected" as const,
    user_id: "user2"
  },
  {
    id: 3,
    start: "08:00",
    end: "08:30",
    size: 1,
    status: "available" as const
  },
  {
    id: 4,
    start: "08:30",
    end: "09:00",
    size: 1,
    status: "available" as const
  },
  {
    id: 5,
    start: "09:00",
    end: "09:30",
    size: 1,
    status: "pending" as const,
    user_id: "user3"
  }
];

export function CalendarDemo() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Daily Calendar Demo</h1>
      <DailyCalendar 
        slots={sampleSlots} 
        date={new Date('2025-08-25')}
        room="Conference Room A"
        location="Downtown"
        building="Main Office"
        bookings={sampleBookings}
      />
    </div>
  );
}
