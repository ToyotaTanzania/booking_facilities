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

export type FacilityTypeColumn = {
  name: string;
  description: string | null;
  created_at: string;
};

interface CellActionProps {
  data: FacilityTypeColumn;
  onEdit: (data: FacilityTypeColumn) => void;
}

const CellAction: React.FC<CellActionProps> = ({
  data,
  onEdit,
}) => {
  const utils = api.useUtils();
  
  const { mutate: deleteFacilityType } = api.facilityType.delete.useMutation({
    onSuccess: () => {
      toast.success("Facility type deleted successfully");
      void utils.facilityType.list.invalidate();
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
            <p>Edit facility type</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <ConfirmModal 
              onConfirm={() => deleteFacilityType(data.name)}
              itemToConfirm={data.name}
              title="Delete Facility Type"
              description="This action cannot be undone. To confirm deletion, please enter the facility type name"
              confirmText="Delete Facility Type"
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
            <p>Delete facility type</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export const columns = (onEdit: (data: FacilityTypeColumn) => void): ColumnDef<FacilityTypeColumn>[] => [
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
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
      const description = row.getValue("description") as string | null;
      return description || "-";
    },
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Created At
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = row.getValue("created_at") as string;
      return new Date(date).toLocaleDateString();
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original as FacilityTypeColumn} onEdit={onEdit} />,
  },
];
