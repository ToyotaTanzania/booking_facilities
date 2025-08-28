"use client";

import { CreateUser } from "./create-user"; 
import { UpdateUser } from "./update-user";
import { type UserColumn } from "./users-table";

interface UsersModalsProps {
  isCreateOpen: boolean;
  isUpdateOpen: boolean;
  selectedUser: UserColumn | null;
  onCloseCreate: () => void;
  onCloseUpdate: () => void;
}

export function UsersModals({
  isCreateOpen,
  isUpdateOpen,
  selectedUser,
  onCloseCreate,
  onCloseUpdate,
}: UsersModalsProps) {
  return (
    <>
      <CreateUser
        isOpen={isCreateOpen}
        onClose={onCloseCreate}
      />
      {selectedUser && (
        <UpdateUser
          isOpen={isUpdateOpen}
          onClose={onCloseUpdate}
          data={selectedUser}
        />
      )}
    </>
  );
}
