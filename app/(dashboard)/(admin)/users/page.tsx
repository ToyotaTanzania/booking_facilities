import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { UsersClient } from "./_components/users-client";

export default function UsersPage() {
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <Heading
            title="User Management"
            description="Manage system users, roles, and permissions"
          />
        </div>
        <Separator />
        
        <UsersClient />
      </div>
    </div>
  );
}
