"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Pencil, Trash, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { ConfirmModal } from "@/components/modals/confirm-modal";
import { AssignResponsiblePersonModal } from "./assign-responsible-person-modal";
import { AssignScheduleModal } from "./assign-schedule-modal";
import { ViewScheduleSlotsModal } from "./view-schedule-slots-modal";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import _ from "lodash";

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
  responsible_person: {
    name: string | null;
    phone: string | null;
    email: string | null;
  } | null;
  schedules: {
    id: number;
    name: string;
    start_time: string;
    end_time: string;
  } | null;
  slots?: Array<{
    id: number;
    start: string;
    end: string;
    start_time: string | null;
    end_time: string | null;
    size: number;
  }>;
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

export const columns = (onEdit: (data: FacilityColumn) => void): ColumnDef<FacilityColumn>[] => {
  const utils = api.useUtils();
  
  const { mutate: removeResponsiblePerson } = api.responsiblePerson.delete.useMutation({
    onSuccess: () => {
      toast.success("Responsible person removed successfully");
      void utils.facility.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const { mutate: removeSchedule } = api.schedule.update.useMutation({
    onSuccess: () => {
      toast.success("Schedule removed from facility successfully");
      void utils.facility.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleRemoveResponsiblePerson = (facilityId: number) => {
    removeResponsiblePerson(facilityId);
  };

  const handleRemoveSchedule = (facilityId: number) => {
    // Find the schedule assigned to this facility and remove it
    // For now, we'll just show a message that this needs to be implemented
    toast.info("Schedule removal functionality needs to be implemented");
  };

  return [
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
    cell: ({ row }) => {
      const name = row.getValue("name") as string;
      return <div className="max-w-40 truncate pl-2">{_.capitalize(name)}</div>;
    },
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.getValue("type") as FacilityColumn["type"];
      return _.capitalize(type?.name)?? "-";
    },
  },
  {
    accessorKey: "building",
    header: "Building",
    cell: ({ row }) => {
      const building = row.getValue("building") as FacilityColumn["building"];
      return building ? (
        <div className="flex flex-col gap-1">
          <span>{_.capitalize(building.name)}</span>
          <span className="text-xs text-muted-foreground">{_.startCase(building.location)}</span>
        </div>
      ) : "-";
    },
  },
  {
    accessorKey: "capacity",
    size: 80,
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Size
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
        <div className="grid grid-cols-2 gap-2 max-w-40">
          {amenities.map((amenity) => (
            <Badge key={amenity} variant="secondary" className="text-xs">
              {_.capitalize(amenity)}
            </Badge>
          ))}
          {/* {amenities.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{amenities.length - 2} more
            </Badge>
          )} */}
        </div>
      );
    },
  },
  {
    accessorKey: "responsible_person",
    header: "Responsible Person",
    cell: ({ row }) => {
      const responsiblePerson = row.getValue("responsible_person") as FacilityColumn["responsible_person"];
      const facility = row.original as FacilityColumn;
      
      return (
        <div className="flex flex-col gap-1">
          {responsiblePerson ? (
            <>
              <span className="font-medium">{_.startCase(responsiblePerson.name)}</span>
              {responsiblePerson.phone && (
                <span className="text-xs text-muted-foreground">{responsiblePerson.phone}</span>
              )}
              {responsiblePerson.email && (
                <span className="text-xs text-muted-foreground">{responsiblePerson.email}</span>
              )}
              <div className="flex gap-1 mt-1">
                <AssignResponsiblePersonModal
                  facilityId={facility.id}
                  facilityName={facility.name}
                  trigger={
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-xs cursor-pointer">
                      Edit
                    </Button>
                  }
                />
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 px-2 text-xs text-destructive hover:text-destructive cursor-pointer"
                  onClick={() => handleRemoveResponsiblePerson(facility.id)}
                >
                  Remove
                </Button>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground text-sm">No responsible person</span>
              <AssignResponsiblePersonModal
                facilityId={facility.id}
                facilityName={facility.name}
                trigger={
                  <Button variant="outline" size="sm" className="h-6 px-2 text-xs">
                    Assign
                  </Button>
                }
              />
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "schedules",
    header: "Schedules",
    cell: ({ row }) => {
      const schedules = row.getValue("schedules") as FacilityColumn["schedules"];
      const facility = row.original as FacilityColumn;
      const slots = facility.slots;
      
      return (
        <div className="flex flex-col gap-1 max-w-40 ">
          {schedules ? (
            <>
              <div className="flex flex-col gap-1">
                <div className="text-xs flex items-center justify-between">
                  <span className="font-medium">{schedules.name}</span>
                  <span className="text-black">
                    {slots?.length ?? 0} slots
                  </span>
                </div>
              </div>

              <div className="flex gap-1 mt-1">
                <ViewScheduleSlotsModal
                  schedules={schedules}
                  slots={slots ?? []}
                  facilityName={facility.name}
                  trigger={
                    <Button  variant="ghost" size="sm" className="h-6 px-2 text-xs cursor-pointer">
                      View All
                    </Button>
                  }
                />
                <AssignScheduleModal
                  facilityId={facility.id}
                  facilityName={facility.name}
                  trigger={
                    <Button variant="outline" size="sm" className="h-6 px-2 text-xs cursor-pointer">
                      Update
                    </Button>
                  }
                />
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 px-2 text-xs text-destructive hover:text-destructive cursor-pointer"
                  onClick={() => handleRemoveSchedule(facility.id)}
                >
                  Remove
                </Button>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground text-sm">No schedules</span>
              <AssignScheduleModal
                facilityId={facility.id}
                facilityName={facility.name}
                trigger={
                  <Button variant="outline" size="sm" className="h-6 px-2 text-xs">
                    Add Schedule
                  </Button>
                }
              />
            </div>
          )}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original as FacilityColumn} onEdit={onEdit} />,
  },
  ];
};
