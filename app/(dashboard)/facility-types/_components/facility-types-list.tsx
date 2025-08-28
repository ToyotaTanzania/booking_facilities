"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "../../_components/data-table";
import { columns, type FacilityTypeColumn } from "./facility-types-table";
import { CreateFacilityType } from "./create-facility-type";
import { UpdateFacilityType } from "./update-facility-type";
import { api } from "@/trpc/react";

export function FacilityTypesList() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<FacilityTypeColumn | null>(null);
  
  const { data: facilityTypes } = api.facilityType.list.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const onEdit = (facilityType: FacilityTypeColumn) => {
    setSelectedType(facilityType);
    setIsUpdateOpen(true);
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
      <DataTable
        columns={columns(onEdit)}
        data={facilityTypes ?? []}
        searchKey="name"
      />
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
