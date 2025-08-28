import { SchedulesList } from "./_components/schedules-list";

export const metadata = {
  title: "Schedules",
  description: "Manage scheduling schemes with time slots and capacities",
};

export default function SchedulesPage() {
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4">
        <SchedulesList />
      </div>
    </div>
  );
}
