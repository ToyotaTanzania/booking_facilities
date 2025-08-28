"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "../../_components/data-table";
import { columns, type LocationColumn } from "./locations-table";
import { CreateLocation } from "./create-location";
import { UpdateLocation } from "./update-location";
import { api } from "@/trpc/react";

export function LocationsList() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationColumn | null>(null);
  
  const { data: locations } = api.location.list.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const onEdit = (location: LocationColumn) => {
    setSelectedLocation(location);
    setIsUpdateOpen(true);
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
      <DataTable
        columns={columns(onEdit)}
        data={locations ?? []}
        searchKey="name"
      />
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
