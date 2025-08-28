"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "../../_components/data-table";
import { columns } from "./columns";
import { api } from "@/trpc/react";

export function BuildingClient() {
  const router = useRouter();
  const { data: buildings, isLoading } = api.building.list.useQuery();

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title="Buildings"
          description="Manage facility buildings"
        />
        <Button onClick={() => router.push("/dashboard/buildings/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Add New
        </Button>
      </div>
      <Separator />
      <DataTable
        columns={columns}
        data={buildings ?? []}
        searchKey="name"
      />
    </>
  );
}
