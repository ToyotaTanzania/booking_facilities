"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { User, Phone, Mail } from "lucide-react";

interface AssignResponsiblePersonModalProps {
  facilityId: number;
  facilityName: string | null;
  trigger: React.ReactNode;
}

interface UserProfile {
  userid: string;
  name: string;
  phone: string | null;
  email: string | null;
}

export function AssignResponsiblePersonModal({
  facilityId,
  facilityName,
  trigger,
}: AssignResponsiblePersonModalProps) {
  const [open, setOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [email, setEmail] = useState<string>("");

  const utils = api.useUtils();

  // Fetch users from profiles table
  const { data: users } = api.auth.users.getAll.useQuery();

  // Create responsible person mutation
  const { mutate: createResponsiblePerson, isPending } = api.responsiblePerson.create.useMutation({
    onSuccess: () => {
      toast.success("Responsible person assigned successfully");
      setOpen(false);
      void utils.facility.list.invalidate();
      void utils.responsiblePerson.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Handle user selection
  const handleUserSelect = (userId: string) => {
    setSelectedUserId(userId);
    const selectedUser = users?.find((user: any) => user.userid === userId);
    if (selectedUser) {
      setName(selectedUser.name || "");
      setPhone(selectedUser.phone || "");
      setEmail(selectedUser.email || "");
    }
  };

  // Handle form submission
  const handleSubmit = () => {
    if (!selectedUserId) {
      toast.error("Please select a user");
      return;
    }

    createResponsiblePerson({
      user: selectedUserId,
      facility: facilityId,
      name: name || null,
      phone: phone || null,
      email: email || null,
    });
  };

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!open) {
      setSelectedUserId("");
      setName("");
      setPhone("");
      setEmail("");
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Assign Responsible Person</DialogTitle>
          <DialogDescription>
            Assign a responsible person to {facilityName || "this facility"}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="user">Select User</Label>
            <Select value={selectedUserId} onValueChange={handleUserSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a user from profiles" />
              </SelectTrigger>
              <SelectContent>
                {users?.map((user: any) => (
                  <SelectItem key={user.userid} value={user.userid}>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>{user.name}</span>
                      {user.phone && (
                        <span className="text-muted-foreground text-xs">
                          ({user.phone})
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-10"
                placeholder="Enter name"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="phone">Phone</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="pl-10"
                placeholder="Enter phone number"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                placeholder="Enter email address"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={isPending || !selectedUserId}
          >
            {isPending ? "Assigning..." : "Assign Responsible Person"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
