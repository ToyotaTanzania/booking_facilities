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

export type LocationColumn = {
  name: string;
  address: string | null;
  created_at: string;
};

interface CellActionProps {
  data: LocationColumn;
  onEdit: (data: LocationColumn) => void;
}

const CellAction: React.FC<CellActionProps> = ({
  data,
  onEdit,
}) => {
  const utils = api.useUtils();
  
  const { mutate: deleteLocation } = api.location.delete.useMutation({
    onSuccess: () => {
      toast.success("Location deleted successfully");
      void utils.location.list.invalidate();
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
            <p>Edit location</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <ConfirmModal 
              onConfirm={() => deleteLocation(data.name)}
              itemToConfirm={data.name}
              title="Delete Location"
              description="This action cannot be undone. To confirm deletion, please enter the location name"
              confirmText="Delete Location"
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
            <p>Delete location</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export const columns = (onEdit: (data: LocationColumn) => void): ColumnDef<LocationColumn>[] => [
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
    accessorKey: "address",
    header: "Address",
  },
  {
    accessorKey: "created_at",
    header: "Date Created",
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at") as string);
      return <div>{date.toLocaleDateString()}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original as LocationColumn} onEdit={onEdit} />,
  },
];