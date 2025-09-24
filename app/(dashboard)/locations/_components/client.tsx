"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "../../_components/data-table";
import { columns, type LocationColumn } from "./columns";
import { LocationModal } from "./location-modal";
import { api } from "@/trpc/react";
import { AgGridReact } from "ag-grid-react";


export function LocationClient() {
  const [open, setOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationColumn | null>(null);
  
  const { data: locations, isLoading } = api.location.list.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const onEdit = (location: LocationColumn) => {
    setSelectedLocation(location);
    setOpen(true);
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title="Locations"
          description="Manage facility locations"
        />
        <Button onClick={() => setOpen(true)}>
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
              rowData={locations ?? []}
              columnDefs={[
                { field: "name" },
                { field: "address" },
            ]}
          />
      </div>
      <LocationModal
        isOpen={open}
        onClose={() => {
          setOpen(false);
          setSelectedLocation(null);
        }}
        initialData={selectedLocation}
      />
    </>
  );
}