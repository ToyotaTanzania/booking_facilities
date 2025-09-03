"use client";


import { useCalendar } from "@/calendar/contexts/calendar-context";
import type { Facility } from "@/datatypes/types/facility";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/trpc/react";
import _ from "lodash";

export function FacilitySelect() {
  
  const { selectedFacilityId, setSelectedFacilityId, selectedBuildingId, selectLocationId } = useCalendar();
  const { data: facilities } = api.facility.list.useQuery() as { data: Facility[] };

  const values = ( value: Facility ) => {
    if(selectLocationId !== "all" && selectedBuildingId !== "all") {
      return `${_.capitalize(value?.name ?? "")}`;
    } else if(selectedBuildingId === "all" && selectLocationId !== "all") {
      return `${_.capitalize(value?.building?.name ?? "")}-${_.capitalize(value?.name ?? "")}`;
    } else {
      return `${_.capitalize(value?.name ?? "")} (${_.capitalize(value?.building?.name ?? "")}-${_.capitalize(value?.building?.location ?? "")})`;
    }
  }

  return (
    <Select value={selectedFacilityId.toString() ?? ""} onValueChange={(value) => setSelectedFacilityId(value)}>
      <SelectTrigger className="flex-1 md:w-48">
        <SelectValue />
      </SelectTrigger>

      <SelectContent align="end">
        <SelectItem value="all">
          <div className="flex items-center gap-1">
            All Facilities
          </div>
        </SelectItem>

        {facilities?.map((facility: Facility) => (
            <SelectItem key={facility.name} value={facility.id?.toString() ?? ""} className="flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate">{ values(facility) }

              </p>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
