"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Pencil, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { ConfirmModal } from "@/components/modals/confirm-modal";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

export type FacilityColumn = {
  id: number;
  name: string | null;
  type: {
    name: string;
  } | null;
  building: {
    id: number;
    name: string | null;
    location: string | null;
  } | null;
  description: string | null;
  amenities: string[] | null;
  capacity: number | null;
  images: Record<string, unknown> | null;
  created_at: string;
};

interface CellActionProps {
  data: FacilityColumn;
  onEdit: (data: FacilityColumn) => void;
}

const CellAction: React.FC<CellActionProps> = ({
  data,
  onEdit,
}) => {
  const utils = api.useUtils();
  
  const { mutate: deleteFacility } = api.facility.delete.useMutation({
    onSuccess: () => {
      toast.success("Facility deleted successfully");
      void utils.facility.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <div className="flex items-center gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onEdit(data)}
            >
              <Pencil className="h-4 w-4 text-muted-foreground" />
              <span className="sr-only">Edit {data.name}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Edit facility</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <ConfirmModal 
              onConfirm={() => deleteFacility(data.id)}
              itemToConfirm={data.name ?? ""}
              title="Delete Facility"
              description="This action cannot be undone. To confirm deletion, please enter the facility name"
              confirmText="Delete Facility"
            >
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
              >
                <Trash className="h-4 w-4 text-destructive" />
                <span className="sr-only">Delete {data.name}</span>
              </Button>
            </ConfirmModal>
          </TooltipTrigger>
          <TooltipContent>
            <p>Delete facility</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export const columns = (onEdit: (data: FacilityColumn) => void): ColumnDef<FacilityColumn>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.getValue("type") as FacilityColumn["type"];
      return type?.name ?? "-";
    },
  },
  {
    accessorKey: "building",
    header: "Building",
    cell: ({ row }) => {
      const building = row.getValue("building") as FacilityColumn["building"];
      return building ? (
        <div className="flex flex-col gap-1">
          <span>{building.name}</span>
          <span className="text-xs text-muted-foreground">{building.location}</span>
        </div>
      ) : "-";
    },
  },
  {
    accessorKey: "capacity",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Capacity
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "amenities",
    header: "Amenities",
    cell: ({ row }) => {
      const amenities = row.getValue("amenities") as string[] | null;
      if (!amenities?.length) return "-";
      
      return (
        <div className="flex flex-wrap gap-1">
          {amenities.map((amenity) => (
            <Badge key={amenity} variant="secondary">
              {amenity}
            </Badge>
          ))}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original as FacilityColumn} onEdit={onEdit} />,
  },
];
