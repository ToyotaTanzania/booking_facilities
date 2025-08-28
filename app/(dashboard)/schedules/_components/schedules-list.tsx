"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "../../_components/data-table";
import { columns, type ScheduleColumn } from "./schedules-table";
import { CreateSchedule } from "./create-schedule";
import { UpdateSchedule } from "./update-schedule";
import { api } from "@/trpc/react";

export function SchedulesList() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleColumn | null>(null);
  
  const { data: schedules } = api.schedule.list.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const onEdit = (schedule: ScheduleColumn) => {
    setSelectedSchedule(schedule);
    setIsUpdateOpen(true);
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title="Schedules"
          description="Manage scheduling schemes with time slots and capacities"
        />
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Schedule
        </Button>
      </div>
      <Separator />
      <DataTable
        columns={columns(onEdit)}
        data={schedules ?? []}
        searchKey="name"
      />
      <CreateSchedule
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />
      {selectedSchedule && (
        <UpdateSchedule
          isOpen={isUpdateOpen}
          onClose={() => {
            setIsUpdateOpen(false);
            setSelectedSchedule(null);
          }}
          data={selectedSchedule}
        />
      )}
    </>
  );
}
