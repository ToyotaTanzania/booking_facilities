"use client";


import { useCalendar } from "@/calendar/contexts/calendar-context";
import type { Location } from "@/datatypes/types/location";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/trpc/react";
import _ from "lodash";

export function LocationSelect() {
  
  const { selectLocationId, setSelectLocationId } = useCalendar();
  const { data: locations } = api.location.list.useQuery() as { data: Location[] };


  return (
    <Select value={selectLocationId} onValueChange={(value) => setSelectLocationId(value)}>
      <SelectTrigger className="flex-1 md:w-48">
        <SelectValue />
      </SelectTrigger>

      <SelectContent align="end">
        <SelectItem value="all">
          <div className="flex items-center gap-1">
            All Locations
          </div>
        </SelectItem>

        {locations?.map((location: Location) => (
            <SelectItem key={location.name} value={location.name} className="flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate">{_.capitalize(location.name)}</p>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
