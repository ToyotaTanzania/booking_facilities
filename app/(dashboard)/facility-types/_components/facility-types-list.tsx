"use client";

import { useState } from "react";
import { Plus, Pencil, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { type FacilityTypeColumn } from "./facility-types-table";
import { CreateFacilityType } from "./create-facility-type";
import { UpdateFacilityType } from "./update-facility-type";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { ConfirmModal } from "@/components/modals/confirm-modal";

import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community'; 
ModuleRegistry.registerModules([AllCommunityModule]);
import { AgGridReact } from 'ag-grid-react';

export function FacilityTypesList() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<FacilityTypeColumn | null>(null);
  
  const { data: facilityTypes } = api.facilityType.list.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const ActionsCell = ({ data }: { data: FacilityTypeColumn }) => {
    const utils = api.useUtils();
    const { mutate: deleteType, isPending: isDeleting } = api.facilityType.delete.useMutation({
      onSuccess: () => {
        toast.success("Facility type deleted successfully");
        void utils.facilityType.list.invalidate();
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
            setSelectedType(data);
            setIsUpdateOpen(true);
          }}
        >
          <Pencil className="h-4 w-4 text-muted-foreground" />
          <span className="sr-only">Edit {data.name ?? ''}</span>
        </Button>
        <ConfirmModal
          onConfirm={() => deleteType(data.name)}
          itemToConfirm={data.name ?? ""}
          title="Delete Facility Type"
          description="This action cannot be undone. To confirm deletion, please enter the facility type name"
          confirmText={isDeleting ? "Deleting..." : "Delete Facility Type"}
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
          title="Facility Types"
          description="Manage facility types"
        />
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add New
        </Button>
      </div>
      <Separator />
      <div style={{ height: 500 }}>
        <AgGridReact
          rowData={facilityTypes ?? []}
          suppressCellFocus={true}
          defaultColDef={{ flex: 1, minWidth: 150, sortable: true, filter: true, resizable: true }}
          columnDefs={[
            { headerName: "Name", field: "name" },
            { headerName: "Description", field: "description" },
            {
              headerName: "Actions",
              field: "actions",
              maxWidth: 140,
              filter: false,
              sortable: false,
              resizable: false,
              cellRenderer: (params: { data: FacilityTypeColumn }) => (
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
      <CreateFacilityType
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />
      {selectedType && (
        <UpdateFacilityType
          isOpen={isUpdateOpen}
          onClose={() => {
            setIsUpdateOpen(false);
            setSelectedType(null);
          }}
          data={selectedType}
        />
      )}
    </>
  );
}
