"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "../../_components/data-table";
import { columns, type FacilityColumn } from "./facilities-table";
import { CreateFacility } from "./create-facility";
import { UpdateFacility } from "./update-facility";
import { api } from "@/trpc/react";

export function FacilitiesList() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState<FacilityColumn | null>(null);
  
  const { data: facilities } = api.facility.list.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const onEdit = (facility: FacilityColumn) => {
    setSelectedFacility(facility);
    setIsUpdateOpen(true);
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
      <DataTable
        columns={columns(onEdit)}
        data={facilities ?? []}
        searchKey="name"
      />
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
