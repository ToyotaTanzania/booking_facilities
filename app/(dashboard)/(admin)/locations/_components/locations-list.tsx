"use client";

import { useState } from "react";
import { Plus, Pencil, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { type LocationColumn } from "./locations-table";
import { CreateLocation } from "./create-location";
import { UpdateLocation } from "./update-location";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { ConfirmModal } from "@/components/modals/confirm-modal";


import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community'; 
ModuleRegistry.registerModules([AllCommunityModule]);
import { AgGridReact } from 'ag-grid-react';

export function LocationsList() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationColumn | null>(null);
  
  const { data: locations, isLoading } = api.location.list.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  // no onEdit needed; ActionsCell will handle edit open

  // Actions cell reusing existing edit/delete flow without creating new files
  const ActionsCell = ({ data }: { data: LocationColumn }) => {
    const utils = api.useUtils();
    const { mutate: deleteLocation, isPending: isDeleting } = api.location.delete.useMutation({
      onSuccess: () => {
        toast.success("Location deleted successfully");
        void utils.location.list.invalidate();
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
            setSelectedLocation(data);
            setIsUpdateOpen(true);
          }}
        >
          <Pencil className="h-4 w-4 text-muted-foreground" />
          <span className="sr-only">Edit {data.name}</span>
        </Button>
        <ConfirmModal
          onConfirm={() => deleteLocation(data.name)}
          itemToConfirm={data.name}
          title="Delete Location"
          description="This action cannot be undone. To confirm deletion, please enter the location name"
          confirmText={isDeleting ? "Deleting..." : "Delete Location"}
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
          title="Locations"
          description="Manage facility locations"
        />
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add New
        </Button>
      </div>
      <Separator />
      {/* <DataTable
        columns={columns(onEdit)}
        data={locations ?? []}
        searchKey="name"
      /> */}
       <div style={{ height: 500 }}>
          <AgGridReact
              loading={isLoading}
              rowData={locations ?? []}
              cellSelection={false}
              suppressCellFocus={true}
              defaultColDef={{
                flex: 1, 
                minWidth: 150, 
                sortable: true,
                filter: true, resizable: true 
              }}
              columnDefs={[
                { field: "name" },
                { field: "address" },
                { 
                  headerName: "Actions",
                  field: "actions",
                  maxWidth: 140,
                  filter: false,
                  sortable: false,
                  resizable: false,
                  cellRenderer: (params: { data: LocationColumn }) => (
                    <ActionsCell data={params.data} />
                  ),
                }
            ]}
          />
      </div>
      {/* Remove AG Grid cell selection/focus border */}
      <style jsx global>{`
        .ag-cell-focus,
        .ag-cell:focus,
        .ag-cell.ag-cell-focus {
          border: none !important;
          outline: none !important;
          box-shadow: none !important;
        }
      `}</style>
      <CreateLocation
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />
      {selectedLocation && (
        <UpdateLocation
          isOpen={isUpdateOpen}
          onClose={() => {
            setIsUpdateOpen(false);
            setSelectedLocation(null);
          }}
          data={selectedLocation}
        />
      )}
    </>
  );
}
