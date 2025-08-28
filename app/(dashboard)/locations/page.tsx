import { LocationsList } from "./_components/locations-list";

export const metadata = {
  title: "Locations",
  description: "Manage facility locations",
};

export default function LocationsPage() {
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4">
        <LocationsList />
      </div>
    </div>
  );
}