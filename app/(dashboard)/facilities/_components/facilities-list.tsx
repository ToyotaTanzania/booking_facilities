"use client";

import { useState } from "react";
import { Plus, Pencil, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { type FacilityColumn } from "./facilities-table";
import { CreateFacility } from "./create-facility";
import { UpdateFacility } from "./update-facility";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { ConfirmModal } from "@/components/modals/confirm-modal";
import { AssignResponsiblePersonModal } from "./assign-responsible-person-modal";
import { AssignScheduleModal } from "./assign-schedule-modal";

import { AllCommunityModule, ModuleRegistry, type ValueGetterParams } from 'ag-grid-community'; 
ModuleRegistry.registerModules([AllCommunityModule]);
import { AgGridReact } from 'ag-grid-react';

export function FacilitiesList() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState<FacilityColumn | null>(null);
  
  const { data: facilities } = api.facility.list.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const ActionsCell = ({ data }: { data: FacilityColumn }) => {
    const utils = api.useUtils();
    const { mutate: deleteFacility, isPending: isDeleting } = api.facility.delete.useMutation({
      onSuccess: () => {
        toast.success("Facility deleted successfully");
        void utils.facility.list.invalidate();
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
          onClick={() => {
            setSelectedFacility(data);
            setIsUpdateOpen(true);
          }}
        >
          <Pencil className="h-4 w-4 text-muted-foreground" />
          <span className="sr-only">Edit {data.name ?? ''}</span>
        </Button>
        <ConfirmModal
          onConfirm={() => deleteFacility(data.id)}
          itemToConfirm={data.name ?? ""}
          title="Delete Facility"
          description="This action cannot be undone. To confirm deletion, please enter the facility name"
          confirmText={isDeleting ? "Deleting..." : "Delete Facility"}
        >
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Trash className="h-4 w-4 text-destructive" />
            <span className="sr-only">Delete {data.name ?? ''}</span>
          </Button>
        </ConfirmModal>
      </div>
    );
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title="Facilities"
          description="Manage facilities"
        />
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add New
        </Button>
      </div>
      <Separator />
      <div style={{ height: 500 }}>
        <AgGridReact<FacilityColumn>
          rowData={facilities ?? []}
          suppressCellFocus={true}
          defaultColDef={{ flex: 1, minWidth: 150, sortable: true, filter: true, resizable: true }}
          columnDefs={[
            { headerName: "Name", field: "name" },
            { headerName: "Type", valueGetter: (p: ValueGetterParams<FacilityColumn, string>) => p.data?.type?.name ?? '-' },
            { headerName: "Building", valueGetter: (p: ValueGetterParams<FacilityColumn, string>) => p.data?.building?.name ?? '-' },
            { headerName: "Capacity", field: "capacity", maxWidth: 120 },
            {
              headerName: "Responsible",
              field: "responsible_person",
              valueGetter: (p: ValueGetterParams<FacilityColumn, string>) => p.data?.responsible_person?.name ?? '-',
              cellRenderer: (params: { data: FacilityColumn }) => {
                const facility = params.data;
                const rp = facility?.responsible_person;
                return (
                  <div className="flex items-center justify-between gap-2">
                    <div className="truncate">
                      {rp?.name ?? '-'}
                    </div>
                    <AssignResponsiblePersonModal
                      facilityId={facility.id}
                      facilityName={facility.name}
                      trigger={
                        <Button variant={rp ? "ghost" : "outline"} size="sm" className="h-7 px-2 text-xs">
                          {rp ? "Edit" : "Assign"}
                        </Button>
                      }
                    />
                  </div>
                );
              },
            },
            {
              headerName: "Schedule",
              field: "schedules",
              valueGetter: (p: ValueGetterParams<FacilityColumn, string>) => p.data?.schedules?.name ?? '-',
              cellRenderer: (params: { data: FacilityColumn }) => {
                const facility = params.data;
                const schedule = facility?.schedules;
                const slotsCount = Array.isArray(facility?.slots) ? facility.slots.length : 0;
                return (
                  <div className="flex items-center justify-between gap-2 w-full">
                    <div className="truncate">
                      {schedule?.name ?? '-'}{schedule ? (
                        <span className="text-xs text-muted-foreground ml-2">{slotsCount} slots</span>
                      ) : null}
                    </div>
                    <AssignScheduleModal
                      facilityId={facility.id}
                      facilityName={facility.name}
                      trigger={
                        <Button variant={schedule ? "ghost" : "outline"} size="sm" className="h-7 px-2 text-xs">
                          {schedule ? "Update" : "Assign"}
                        </Button>
                      }
                    />
                  </div>
                );
              },
            },
            {
              headerName: "Actions",
              maxWidth: 140,
              filter: false,
              sortable: false,
              resizable: false,
              cellRenderer: (params: { data: FacilityColumn }) => (
                <ActionsCell data={params.data} />
              ),
            },
          ]}
        />
      </div>
      <style jsx global>{`
        .ag-cell-focus,
        .ag-cell:focus,
        .ag-cell.ag-cell-focus { border: none !important; outline: none !important; box-shadow: none !important; }
      `}</style>
      <CreateFacility
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />
      {selectedFacility && (
        <UpdateFacility
          isOpen={isUpdateOpen}
          onClose={() => {
            setIsUpdateOpen(false);
            setSelectedFacility(null);
          }}
          data={selectedFacility}
        />
      )}
    </>
  );
}
