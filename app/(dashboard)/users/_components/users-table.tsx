"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Pencil, Trash, MoreHorizontal, User, Shield, Mail, Phone, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { ControlledConfirmModal } from "@/components/modals/confirm-modal";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export type UserColumn = {
  id: string;
  email: string;
  name: string | null;
  role: 'admin' | 'user';
  status: 'active' | 'inactive' | 'suspended';
  avatar_url: string | null;
  phone: string | null;
  department: string | null;
  created_at: string;
  updated_at: string;
  user_profiles: Array<{
    created_at: string;
    userid: string;
    name: string;
    phone: string | null;
    unit: string | null;
    segment: string | null;
    division: string | null;
    legal_entity: string | null;
    isActive: boolean;
    role: string | null;
  }> | null;
};

interface CellActionProps {
  data: UserColumn;
  onEdit: (data: UserColumn) => void;
}

const CellAction: React.FC<CellActionProps> = ({
  data,
  onEdit,
}) => {
  const utils = api.useUtils();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  
  const { mutate: deleteUser } = api.user.delete.useMutation({
    onSuccess: () => {
      toast.success("User deleted successfully");
      void utils.user.list.invalidate();
      setIsDeleteModalOpen(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const { mutate: changeStatus } = api.user.changeStatus.useMutation({
    onSuccess: () => {
      toast.success("User status updated successfully");
      void utils.user.list.invalidate();
      setIsStatusModalOpen(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const { mutate: changeRole } = api.user.changeRole.useMutation({
    onSuccess: () => {
      toast.success("User role updated successfully");
      void utils.user.list.invalidate();
      setIsRoleModalOpen(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleDeleteUser = () => {
    deleteUser(data.id);
  };

  const handleChangeStatus = (newStatus: 'active' | 'inactive' | 'suspended') => {
    changeStatus({ id: data.id, status: newStatus });
  };

  const handleChangeRole = (newRole: 'admin' | 'user') => {
    changeRole({ id: data.id, role: newRole });
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onEdit(data)}
              >
                <Pencil className="h-4 w-4 text-muted-foreground" />
                <span className="sr-only">Edit {data.name}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Edit user</p>
            </TooltipContent>
          </Tooltip>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(data)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit User
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              
              {/* Status Management */}
              <DropdownMenuItem 
                onClick={() => setIsStatusModalOpen(true)}
                className="text-blue-600 focus:text-blue-600"
              >
                <Shield className="mr-2 h-4 w-4" />
                Change Status
              </DropdownMenuItem>

              {/* Role Management */}
              <DropdownMenuItem 
                onClick={() => setIsRoleModalOpen(true)}
                className="text-purple-600 focus:text-purple-600"
              >
                <User className="mr-2 h-4 w-4" />
                Change Role
              </DropdownMenuItem>

              <DropdownMenuItem 
                onClick={() => setIsDeleteModalOpen(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete User
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TooltipProvider>
      </div>

      {/* Delete User Modal */}
      <ControlledConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteUser}
        itemToConfirm={data.name ?? data.email}
        title="Delete User"
        description={`This will permanently delete the user "${data.name ?? data.email}" and all associated data. This action cannot be undone.`}
        confirmText="Delete User"
      />

      {/* Change Status Modal */}
      <ControlledConfirmModal 
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        onConfirm={() => handleChangeStatus(data.status === 'active' ? 'inactive' : 'active')}
        itemToConfirm={`change status of "${data.name ?? data.email}" to ${data.status === 'active' ? 'inactive' : 'active'}`}
        title="Change User Status"
        description={`This will change the status of "${data.name ?? data.email}" from ${data.status} to ${data.status === 'active' ? 'inactive' : 'active'}.`}
        confirmText="Change Status"
      />

      {/* Change Role Modal */}
      <ControlledConfirmModal 
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        onConfirm={() => handleChangeRole(data.role === 'admin' ? 'user' : 'admin')}
        itemToConfirm={`change role of "${data.name ?? data.email}" to ${data.role === 'admin' ? 'user' : 'admin'}`}
        title="Change User Role"
        description={`This will change the role of "${data.name ?? data.email}" from ${data.role} to ${data.role === 'admin' ? 'user' : 'admin'}.`}
        confirmText="Change Role"
      />
    </>
  );
};

export const columns = (onEdit: (data: UserColumn) => void): ColumnDef<UserColumn>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          User
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar_url || undefined} />
            <AvatarFallback>
            {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium">{user.name || 'No Name'}</span>
            <span className="text-sm text-muted-foreground">{user.email}</span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "role",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Role
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const role = row.original.role;
      return (
        <Badge className={getRoleColor(role)}>
          <Shield className="mr-1 h-3 w-3" />
          {role}
        </Badge>
      );
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <Badge className={getStatusColor(status)}>
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "department",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Department
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const department = row.original.department;
      return (
        <div className="flex items-center gap-1">
          <Building className="h-4 w-4 text-muted-foreground" />
          <span>{department || 'No Department'}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "phone",
    header: "Contact",
    cell: ({ row }) => {
      const phone = row.original.phone;
      return (
        <div className="flex items-center gap-1">
          <Phone className="h-4 w-4 text-muted-foreground" />
          <span>{phone || 'No Phone'}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Created
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = new Date(row.original.created_at);
      return (
        <span className="text-sm text-muted-foreground">
          {date.toLocaleDateString()}
        </span>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original as UserColumn} onEdit={onEdit} />,
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'inactive':
      return 'bg-gray-100 text-gray-800';
    case 'suspended':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getRoleColor = (role: string) => {
  switch (role) {
    case 'admin':
      return 'bg-purple-100 text-purple-800';
    case 'user':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};
