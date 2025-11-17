"use client";

import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter.js";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore.js";
import timezone from "dayjs/plugin/timezone.js";
import utc from "dayjs/plugin/utc.js";
import { IlamyCalendar } from "@ilamy/calendar";
import { faker } from "@faker-js/faker";
import { capitalize } from "lodash";

// dayjs.extend(isSameOrAfter);
// dayjs.extend(isSameOrBefore);
// dayjs.extend(timezone);
// dayjs.extend(utc);

const statuses = [
  { id: faker.string.uuid(), name: "Planned", color: "#6B7280" },
  { id: faker.string.uuid(), name: "In Progress", color: "#F59E0B" },
  { id: faker.string.uuid(), name: "Done", color: "#10B981" },
];

const exampleFeatures = Array.from({ length: 20 })
  .fill(null)
  .map(() => {

  const start = faker.date.recent({ days: 1 });
  const end = new Date(start.getTime() + 30 * 60 * 1000);
    return {
      id: faker.string.uuid(),
      title: capitalize(faker.company.buzzPhrase()),
      description: faker.lorem.sentence(),
      // start: new Date('2024-01-20T23:59:59'),
      // end: new Date('2024-01-20T23:59:59'),
      start: start,
      end: end,
      allDay: false,
      data: statuses,
      // backgroundColor: faker.color.human(),
      // color: faker.color.rgb(),
      // id: faker.string.uuid(),
      // name: capitalize(faker.company.buzzPhrase()),
      // startAt: faker.date.past({ years: 0.5, refDate: new Date() }),
      // endAt: faker.date.future({ years: 0.5, refDate: new Date() }),
      // status: faker.helpers.arrayElement(statuses),
    }
  });

export default function KarimjeeCalendar() {
  return (
    <div className="relative">
      <IlamyCalendar 
        events={exampleFeatures} 
        firstDayOfWeek="monday"
        stickyViewHeader={true}
        disableCellClick={true}
        disableDragAndDrop={true}
        initialView="week"
        renderEvent={
          (calendarEvent) => {
            console.log(calendarEvent)
            return (
              <div className="bg-red-500 text-white p-2 rounded-md">
                {calendarEvent.title}
              </div>
            )
          }
        }
      />
    </div>
  );
}
