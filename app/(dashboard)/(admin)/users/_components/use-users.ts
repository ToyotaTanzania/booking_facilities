import { useState } from "react";
import { api } from "@/trpc/react";
import { type UserColumn } from "./users-table";

export function useUsers() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserColumn | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: users, isLoading } = api.auth.users.list.useQuery({
    search: searchQuery || undefined,
    role: roleFilter === "all" ? undefined : (roleFilter as "admin" | "user"),
    status: statusFilter === "all" ? undefined : (statusFilter as "active" | "inactive" | "suspended"),
  });

  const onEdit = (user: UserColumn) => {
    setSelectedUser(user);
    setIsUpdateOpen(true);
  };

  const onCreateUser = () => {
    setIsCreateOpen(true);
  };

  const onCloseCreate = () => {
    setIsCreateOpen(false);
  };

  const onCloseUpdate = () => {
    setIsUpdateOpen(false);
    setSelectedUser(null);
  };

  const onSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  const onRoleChange = (value: string) => {
    setRoleFilter(value);
  };

  const onStatusChange = (value: string) => {
    setStatusFilter(value);
  };

  const filteredUsers = users ?? [];

  return {
    // State
    isCreateOpen,
    isUpdateOpen,
    selectedUser,
    searchQuery,
    roleFilter,
    statusFilter,
    isLoading,
    filteredUsers,
    
    // Actions
    onEdit,
    onCreateUser,
    onCloseCreate,
    onCloseUpdate,
    onSearchChange,
    onRoleChange,
    onStatusChange,
  };
}
