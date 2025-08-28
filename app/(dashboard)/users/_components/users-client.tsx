"use client";

import { DataTable } from "@/components/data-table";
import { columns } from "./users-table";
import { UsersFilters } from "./users-filters";
import { UsersActions } from "./users-actions";
import { UsersModals } from "./users-modals";
import { useUsers } from "./use-users";

export function UsersClient() {
  const {
    isCreateOpen,
    isUpdateOpen,
    selectedUser,
    searchQuery,
    roleFilter,
    statusFilter,
    isLoading,
    filteredUsers,
    onEdit,
    onCreateUser,
    onCloseCreate,
    onCloseUpdate,
    onSearchChange,
    onRoleChange,
    onStatusChange,
  } = useUsers();

  return (
    <>
      <UsersActions onCreateUser={onCreateUser} />

      <UsersFilters
        searchQuery={searchQuery}
        roleFilter={roleFilter}
        statusFilter={statusFilter}
        onSearchChange={onSearchChange}
        onRoleChange={onRoleChange}
        onStatusChange={onStatusChange}
      />

      <DataTable
        columns={columns(onEdit)}
        data={filteredUsers}
        searchKey="name"
        isLoading={isLoading}
      />

      <UsersModals
        isCreateOpen={isCreateOpen}
        isUpdateOpen={isUpdateOpen}
        selectedUser={selectedUser}
        onCloseCreate={onCloseCreate}
        onCloseUpdate={onCloseUpdate}
      />
    </>
  );
}
