import { FacilityTypesList } from "./_components/facility-types-list";

export const metadata = {
  title: "Facility Types",
  description: "Manage facility types",
};

export default function FacilityTypesPage() {
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4">
        <FacilityTypesList />
      </div>
    </div>
  );
}
