"use client";
import { faker } from "@faker-js/faker";
import {
  KanbanBoard,
  KanbanCard,
  KanbanCards,
  KanbanHeader,
  KanbanProvider,
} from "@/src/components/ui/shadcn-io/kanban";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { api } from "@/trpc/react";
import _ from "lodash";
import EventItem from "./eventItem";

import {
  MiniCalendar,
  MiniCalendarDay,
  MiniCalendarDays,
  MiniCalendarNavigation,
} from "@/components/ui/mini-calendar";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, ArrowRightIcon, Icon } from "lucide-react";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { AddEventDialog } from "@/calendar/components/dialogs/add-event-dialog";

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

const KarimjeeCalendar = () => {
  const [bookings, setBookings] = useState<any>([]);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const { data: facilities, isLoading: loadingFacilities } =
    api.facility.getAll.useQuery();
  const { data: allBookings, isLoading: loadingBookings } =
    api.booking.filteredBookings.useQuery({
      // date: currentDate.toISOString(),
      date: undefined,
    });

  useEffect(() => {
    if (!allBookings || allBookings.length === 0) return;
    const groupedBookings = _.groupBy(allBookings, "code");
    const mapped = _.map(groupedBookings, (record, code) => {
      const first = record[0];
      const last = record[record.length - 1];
      return {
        id: code,
        date: first.date,
        name: first.description || "",
        start: first.start,
        end: last.end,
        uid: code,
        column: first.facility?.id ? first.facility.id.toString() : "",
        owner: first.user,
        status: first.status,
        description: first.description || "",
        // resourceId: first.facility?.id ? first.facility.id.toString() : "",
      };
    });
    setBookings(mapped);
  }, [allBookings]);

  return (
    <div className="space-y-4">
      <div className="flex w-full justify-between">
        <MiniCalendar
          days={5}
          value={currentDate}
          onValueChange={(date) => setCurrentDate(date || new Date())}
          className="w-full"
        >
          {/* <MiniCalendarNavigation direction="prev" /> */}
          {/* <MiniCalendarNavigation asChild direction="today"> */}
          <Button variant="outline" onClick={() => setCurrentDate(new Date())}>
            Today
          </Button>
          {/* </MiniCalendarNavigation> */}
          <MiniCalendarNavigation asChild direction="prev">
            <Button size="icon" variant="outline">
              <ArrowLeftIcon className="size-4" />
            </Button>
          </MiniCalendarNavigation>

          <MiniCalendarDays>
            {(date) => <MiniCalendarDay date={date} key={date.toISOString()} />}
          </MiniCalendarDays>
          {/* <MiniCalendarNavigation direction="next" /> */}
          <MiniCalendarNavigation asChild direction="next">
            <Button size="icon" variant="outline">
              <ArrowRightIcon className="size-4" />
            </Button>
          </MiniCalendarNavigation>
        </MiniCalendar>
      </div>
      <KanbanProvider
        columns={
          facilities?.map((f) => ({
            id: f.id.toString(),
            name: f.name,
            color: f.color || "#6B7280",
          })) || []
        }
        data={bookings}
        onDataChange={setBookings}
      >
        {(column) => (
          <KanbanBoard
            id={column.id}
            key={column.id}
            className="overflow-x-scroll"
          >
            <KanbanHeader>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full" />
                <span>{column.name}</span>
              </div>
            </KanbanHeader>
            {bookings.some((b: any) => b.column === column.id) ? (
              <KanbanCards id={column.id} className="w-[200px]">
                {(feature: any) => (
                  <KanbanCard
                    draggable={false}
                    column={column.id}
                    id={feature.id}
                    key={feature.id}
                    name={feature.name}
                  >
                    <EventItem event={feature} />
                  </KanbanCard>
                )}
              </KanbanCards>
            ) : (
              <Empty className="p-4 md:p-4 gap-3">
                <EmptyHeader className="gap-1">
                  <EmptyTitle className="text-sm">Empty</EmptyTitle>
                  <EmptyDescription className="text-xs">No booking found</EmptyDescription>
                </EmptyHeader>
                <EmptyContent className="text-xs">
                  {/* Optional actions */}
                </EmptyContent>
              </Empty>
            )}
            {/* Compact empty state shown above when column has no items */}
          </KanbanBoard>
        )}
      </KanbanProvider>
    </div>
  );
};
export default KarimjeeCalendar;
