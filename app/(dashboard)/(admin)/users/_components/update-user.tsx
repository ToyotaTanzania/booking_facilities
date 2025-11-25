"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { userRoleEnum, userStatusEnum } from "@/datatypes/schemas/user";
import { type UserColumn } from "./users-table";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  name: z.string().min(1, "Name is required").optional(),
  role: userRoleEnum.optional(),
  status: userStatusEnum.optional(),
  phone: z.string().nullable().optional(),
  department: z.string().nullable().optional(),
  avatar_url: z.string().url().nullable().optional(),
  profile: z.object({
    name: z.string().min(1, "Profile name is required").optional(),
    phone: z.string().nullable().optional(),
    unit: z.string().nullable().optional(),
    segment: z.string().nullable().optional(),
    division: z.string().nullable().optional(),
    legal_entity: z.string().nullable().optional(),
    isActive: z.boolean().optional(),
    role: z.string().nullable().optional(),
  }).optional(),
});

type UpdateUserValues = z.infer<typeof formSchema>;

interface UpdateUserProps {
  isOpen: boolean;
  onClose: () => void;
  data: UserColumn;
}

export function UpdateUser({ isOpen, onClose, data }: UpdateUserProps) {
  const form = useForm<UpdateUserValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: data.email,
      name: data.name || "",
      role: data.role,
      status: data.status,
      phone: data.phone || "",
      department: data.department || "",
      avatar_url: data.avatar_url || "",
      profile: {
        name: data.user_profiles?.[0]?.name || "",
        phone: data.user_profiles?.[0]?.phone || "",
        unit: data.user_profiles?.[0]?.unit || "",
        segment: data.user_profiles?.[0]?.segment || "",
        division: data.user_profiles?.[0]?.division || "",
        legal_entity: data.user_profiles?.[0]?.legal_entity || "",
        isActive: data.user_profiles?.[0]?.isActive || false,
        role: data.user_profiles?.[0]?.role || "",
      },
    },
  });

  // Update form values when data changes
  useEffect(() => {
    if (data) {
      form.reset({
        email: data.email,
        name: data.name || "",
        role: data.role,
        status: data.status,
        phone: data.phone || "",
        department: data.department || "",
        avatar_url: data.avatar_url || "",
        profile: {
          name: data.user_profiles?.[0]?.name || "",
          phone: data.user_profiles?.[0]?.phone || "",
          unit: data.user_profiles?.[0]?.unit || "",
          segment: data.user_profiles?.[0]?.segment || "",
          division: data.user_profiles?.[0]?.division || "",
          legal_entity: data.user_profiles?.[0]?.legal_entity || "",
          isActive: data.user_profiles?.[0]?.isActive || false,
          role: data.user_profiles?.[0]?.role || "",
        },
      });
    }
  }, [data, form]);

  const utils = api.useUtils();

  const { mutate: updateUser, isPending } = api.auth.users.update.useMutation({
    onSuccess: () => {
      toast.success("User updated successfully");
      onClose();
      void utils.user.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (formData: UpdateUserValues) => {
    // Clean up empty strings to null
    const cleanedData = {
      id: data.id,
      email: formData.email,
      name: formData.name,
      role: formData.role,
      status: formData.status,
      phone: formData.phone || null,
      department: formData.department || null,
      profile: {
        name: formData.profile?.name || null,
        phone: formData.profile?.phone || null,
        unit: formData.profile?.unit || null,
        segment: formData.profile?.segment || null,
        division: formData.profile?.division || null,
        legal_entity: formData.profile?.legal_entity || null,
        isActive: formData.profile?.isActive || null,
        role: formData.profile?.role || null,
      },
    };

    updateUser(cleanedData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Update User: {data.name || data.email}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input
                          disabled={isPending}
                          placeholder="user@example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name *</FormLabel>
                      <FormControl>
                        <Input
                          disabled={isPending}
                          placeholder="John Doe"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

                 <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input
                          disabled={isPending}
                          placeholder="+1 (555) 123-4567"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <FormControl>
                        <Input
                          disabled={isPending}
                          placeholder="Engineering"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue  placeholder="Select role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="suspended">Suspended</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

            </div>

            {/* Profile Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Business Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="profile.unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Unit</FormLabel>
                      <FormControl>
                        <Input
                          disabled={isPending}
                          placeholder="Business Unit"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                 <FormField
                  control={form.control}
                  name="profile.segment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Segment</FormLabel>
                      <FormControl>
                        <Input
                          disabled={isPending}
                          placeholder="Business Segment"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
               
                <FormField
                  control={form.control}
                  name="profile.division"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Division</FormLabel>
                      <FormControl>
                        <Input
                          disabled={isPending}
                          placeholder="Business Division"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="profile.legal_entity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Legal Entity</FormLabel>
                      <FormControl>
                        <Input
                          disabled={isPending}
                          placeholder="Current legal entity"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
              >
                {isPending ? "Updating..." : "Update User"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
