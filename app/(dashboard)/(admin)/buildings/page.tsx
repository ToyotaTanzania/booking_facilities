import { BuildingsList } from "./_components/buildings-list";

export const metadata = {
  title: "Buildings",
  description: "Manage facility buildings",
};

export default function BuildingsPage() {
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4">
        <BuildingsList />
      </div>
    </div>
  );
}