"use client";

import { useState } from "react";
import { Plus, Pencil, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { type ScheduleColumn } from "./schedules-table";
import { CreateSchedule } from "./create-schedule";
import { UpdateSchedule } from "./update-schedule";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { ConfirmModal } from "@/components/modals/confirm-modal";
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
ModuleRegistry.registerModules([AllCommunityModule]);
import { AgGridReact } from 'ag-grid-react';

export function SchedulesList() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleColumn | null>(null);
  
  const { data: schedules, isLoading } = api.schedule.list.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const onEdit = (schedule: ScheduleColumn) => {
    setSelectedSchedule(schedule);
    setIsUpdateOpen(true);
  };

  const ActionsCell = ({ data }: { data: ScheduleColumn }) => {
    const utils = api.useUtils();
    const { mutate: deleteSchedule, isPending: isDeleting } = api.schedule.deleteWithSlots.useMutation({
      onSuccess: () => {
        toast.success("Schedule deleted successfully");
        void utils.schedule.list.invalidate();
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

    return (
      <div className="flex items-center gap-2 justify-end">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => onEdit(data)}
        >
          <Pencil className="h-4 w-4 text-muted-foreground" />
          <span className="sr-only">Edit {data.name}</span>
        </Button>
        <ConfirmModal
          onConfirm={() => deleteSchedule({ id: data.id })}
          itemToConfirm={data.name}
          title="Delete Schedule"
          description="This action cannot be undone. To confirm deletion, please enter the schedule name"
          confirmText={isDeleting ? "Deleting..." : "Delete Schedule"}
        >
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Trash className="h-4 w-4 text-destructive" />
            <span className="sr-only">Delete {data.name}</span>
          </Button>
        </ConfirmModal>
      </div>
    );
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
      <div style={{ height: 500 }}>
        <AgGridReact
          loading={isLoading}
          rowData={schedules ?? []}
          cellSelection={false}
          suppressCellFocus={true}
          defaultColDef={{
            flex: 1,
            minWidth: 150,
            sortable: true,
            filter: true,
            resizable: true,
          }}
          columnDefs={[
            { field: "name" },
            {
              headerName: "Actions",
              field: "actions",
              maxWidth: 140,
              filter: false,
              sortable: false,
              resizable: false,
              cellRenderer: (params: { data: ScheduleColumn }) => (
                <ActionsCell data={params.data} />
              ),
            },
          ]}
        />
      </div>
      <style jsx global>{`
        .ag-cell-focus,
        .ag-cell:focus,
        .ag-cell.ag-cell-focus {
          border: none !important;
          outline: none !important;
          box-shadow: none !important;
        }
      `}</style>
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
