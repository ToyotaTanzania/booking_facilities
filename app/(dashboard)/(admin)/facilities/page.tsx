import { FacilitiesList } from "./_components/facilities-list";

export const metadata = {
  title: "Facilities",
  description: "Manage facilities",
};

export default function FacilitiesPage() {
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4">
        <FacilitiesList />
      </div>
    </div>
  );
}
