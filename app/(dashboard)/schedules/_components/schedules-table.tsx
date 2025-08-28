"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Pencil, Trash, Clock, Users, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { ControlledConfirmModal } from "@/components/modals/confirm-modal";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

export type ScheduleColumn = {
  id: number;
  name: string;
  slots: Array<{
    id: number;
    start: string;
    end: string;
    size: number;
  }> | null;
  created_at: string;
};

interface CellActionProps {
  data: ScheduleColumn;
  onEdit: (data: ScheduleColumn) => void;
}

const CellAction: React.FC<CellActionProps> = ({
  data,
  onEdit,
}) => {
  const utils = api.useUtils();
  const [isDeleteScheduleModalOpen, setIsDeleteScheduleModalOpen] = useState(false);
  const [isDeleteSlotsModalOpen, setIsDeleteSlotsModalOpen] = useState(false);
  
  const { mutate: deleteScheduleWithSlots } = api.schedule.deleteWithSlots.useMutation({
    onSuccess: () => {
      toast.success("Schedule and all associated slots deleted successfully");
      void utils.schedule.list.invalidate();
      setIsDeleteScheduleModalOpen(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const { mutate: deleteSlotsOnly } = api.schedule.deleteSlotsOnly.useMutation({
    onSuccess: () => {
      toast.success("All time slots removed from schedule");
      void utils.schedule.list.invalidate();
      setIsDeleteSlotsModalOpen(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleDeleteScheduleWithSlots = () => {
    deleteScheduleWithSlots({ id: data.id });
  };

  const handleDeleteSlotsOnly = () => {
    deleteSlotsOnly(data.id);
  };

  return (
    <>
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
              <p>Edit schedule</p>
            </TooltipContent>
          </Tooltip>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(data)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit Schedule
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {data.slots && data.slots.length > 0 && (
                <DropdownMenuItem 
                  onClick={() => setIsDeleteSlotsModalOpen(true)}
                  className="text-orange-600 focus:text-orange-600"
                >
                  <Clock className="mr-2 h-4 w-4" />
                  Remove All Slots
                </DropdownMenuItem>
              )}
              <DropdownMenuItem 
                onClick={() => setIsDeleteScheduleModalOpen(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete Schedule & Slots
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TooltipProvider>
      </div>

      {/* Delete Schedule Modal */}
      <ControlledConfirmModal 
        isOpen={isDeleteScheduleModalOpen}
        onClose={() => setIsDeleteScheduleModalOpen(false)}
        onConfirm={handleDeleteScheduleWithSlots}
        itemToConfirm={data.name}
        title="Delete Schedule & All Slots"
        description={`This will permanently delete the schedule "${data.name}" and all ${data.slots?.length || 0} associated time slots. This action cannot be undone.`}
        confirmText="Delete Schedule & Slots"
      />

      {/* Delete Slots Only Modal */}
      {data.slots && data.slots.length > 0 && (
        <ControlledConfirmModal 
          isOpen={isDeleteSlotsModalOpen}
          onClose={() => setIsDeleteSlotsModalOpen(false)}
          onConfirm={handleDeleteSlotsOnly}
          itemToConfirm={`all ${data.slots.length} time slots from "${data.name}"`}
          title="Remove All Time Slots"
          description={`This will remove all ${data.slots.length} time slots from the schedule "${data.name}". The schedule will remain but will have no time slots.`}
          confirmText="Remove All Slots"
        />
      )}
    </>
  );
};

export const columns = (onEdit: (data: ScheduleColumn) => void): ColumnDef<ScheduleColumn>[] => [
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
    accessorKey: "slots",
    header: "Time Slots",
    cell: ({ row }) => {
      const slots = row.getValue("slots") as ScheduleColumn["slots"];
      if (!slots?.length) return "-";
      
      return (
        <div className="space-y-1">
          {slots.map((slot) => (
            <div key={slot.id} className="flex items-center gap-2 text-sm">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span>{slot.start} - {slot.end}</span>
              <Badge variant="secondary" className="gap-1">
                <Users className="h-3 w-3" />
                {slot.size}
              </Badge>
            </div>
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: "slots",
    header: "Total Capacity",
    cell: ({ row }) => {
      const slots = row.getValue("slots") as ScheduleColumn["slots"];
      if (!slots?.length) return "-";
      
      const totalCapacity = slots.reduce((sum, slot) => sum + slot.size, 0);
      return (
        <div className="flex items-center gap-1">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span>{totalCapacity}</span>
        </div>
      );
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
    cell: ({ row }) => <CellAction data={row.original as ScheduleColumn} onEdit={onEdit} />,
  },
];
