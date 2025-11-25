"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UsersActionsProps {
  onCreateUser: () => void;
}

export function UsersActions({ onCreateUser }: UsersActionsProps) {
  return (
    <div className="flex items-center justify-between">
      <Button onClick={onCreateUser}>
        <Plus className="mr-2 h-4 w-4" />
        Add User
      </Button>
    </div>
  );
}
