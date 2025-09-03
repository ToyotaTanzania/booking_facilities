"use client";


import { useCalendar } from "@/calendar/contexts/calendar-context";
import type { Building } from "@/datatypes/types/building";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/trpc/react";
import _ from "lodash";

export function BuildingSelect() {

  const { selectedBuildingId, setSelectedBuildingId, selectLocationId } = useCalendar();
  const { data: buildings } = api.building.list.useQuery();

  return (
    <Select value={selectedBuildingId.toString()} onValueChange={(value) => setSelectedBuildingId(value === "all" ? "all" : value)}>
      <SelectTrigger className="flex-1 md:w-48">
        <SelectValue />
      </SelectTrigger>

      <SelectContent align="end">
        <SelectItem value="all">
          <div className="flex items-center gap-1">
            All Buildings
          </div>
        </SelectItem>

        {buildings?.map((building: Building) => (
          <SelectItem key={building.id} value={building.id?.toString() ?? ""} className="flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate">{_.startCase(building.name ?? "")} { selectLocationId === "all" && `(${_.startCase(building.location ?? "")})` }</p>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
