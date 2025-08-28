"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "../../_components/data-table";
import { columns, type BuildingColumn } from "./buildings-table";
import { CreateBuilding } from "./create-building";
import { UpdateBuilding } from "./update-building";
import { api } from "@/trpc/react";

export function BuildingsList() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingColumn | null>(null);
  
  const { data: buildings } = api.building.list.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const onEdit = (building: BuildingColumn) => {
    setSelectedBuilding(building);
    setIsUpdateOpen(true);
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
      <DataTable
        columns={columns(onEdit)}
        data={buildings ?? []}
        searchKey="name"
      />
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
