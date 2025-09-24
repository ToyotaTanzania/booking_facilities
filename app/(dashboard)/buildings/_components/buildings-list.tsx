"use client";

import { useState } from "react";
import { Plus, Pencil, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { type BuildingColumn } from "./buildings-table";
import { CreateBuilding } from "./create-building";
import { UpdateBuilding } from "./update-building";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { ConfirmModal } from "@/components/modals/confirm-modal";

import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community'; 
ModuleRegistry.registerModules([AllCommunityModule]);
import { AgGridReact } from 'ag-grid-react';

export function BuildingsList() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingColumn | null>(null);
  
  const { data: buildings } = api.building.list.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const ActionsCell = ({ data }: { data: BuildingColumn }) => {
    const utils = api.useUtils();
    const { mutate: deleteBuilding, isPending: isDeleting } = api.building.delete.useMutation({
      onSuccess: () => {
        toast.success("Building deleted successfully");
        void utils.building.list.invalidate();
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
            setSelectedBuilding(data);
            setIsUpdateOpen(true);
          }}
        >
          <Pencil className="h-4 w-4 text-muted-foreground" />
          <span className="sr-only">Edit {data.name ?? ''}</span>
        </Button>
        <ConfirmModal
          onConfirm={() => deleteBuilding(data.id)}
          itemToConfirm={data.name ?? ""}
          title="Delete Building"
          description="This action cannot be undone. To confirm deletion, please enter the building name"
          confirmText={isDeleting ? "Deleting..." : "Delete Building"}
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
          title="Buildings"
          description="Manage facility buildings"
        />
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add New
        </Button>
      </div>
      <Separator />
      <div style={{ height: 500 }}>
        <AgGridReact
          rowData={buildings ?? []}
          suppressCellFocus={true}
          defaultColDef={{
            flex: 1,
            minWidth: 150,
            sortable: true,
            filter: true,
            resizable: true,
          }}
          columnDefs={[
            { headerName: "Name", field: "name" },
            { headerName: "Location", field: "location" },
            { 
              headerName: "Date Created",
              field: "created_at",
              valueFormatter: (p: any) => p.value ? new Date(p.value).toLocaleDateString() : "",
            },
            {
              headerName: "Actions",
              field: "actions",
              maxWidth: 140,
              filter: false,
              sortable: false,
              resizable: false,
              cellRenderer: (params: { data: BuildingColumn }) => (
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
      <CreateBuilding
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />
      {selectedBuilding && (
        <UpdateBuilding
          isOpen={isUpdateOpen}
          onClose={() => {
            setIsUpdateOpen(false);
            setSelectedBuilding(null);
          }}
          data={selectedBuilding}
        />
      )}
    </>
  );
}
