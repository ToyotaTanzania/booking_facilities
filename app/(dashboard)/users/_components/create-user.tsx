"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  name: z.string().min(1, "Name is required"),
  role: userRoleEnum.default("user"),
  status: userStatusEnum.default("active"),
  phone: z.string().nullable(),
  department: z.string().nullable(),
  avatar_url: z.string().url().nullable().or(z.literal("")),
  profile: z
    .object({
      name: z.string().min(1, "Profile name is required"),
      phone: z.string().nullable(),
      unit: z.string().nullable(),
      segment: z.string().nullable(),
      division: z.string().nullable(),
      legal_entity: z.string().nullable(),
      isActive: z.boolean().default(true),
      role: z.string().nullable(),
    })
    .optional(),
});

type CreateUserValues = z.infer<typeof formSchema>;

interface CreateUserProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateUser({ isOpen, onClose }: CreateUserProps) {
  const form = useForm<CreateUserValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      name: "",
      role: "user",
      status: "active",
      phone: "",
      department: "",
      avatar_url: "",
      profile: {
        name: "",
        phone: "",
        unit: "",
        segment: "",
        division: "",
        legal_entity: "",
        isActive: true,
        role: "",
      },
    },
  });

  const utils = api.useUtils();

  const { mutate: createUser, isPending } = api.auth.users.create.useMutation({
    onSuccess: () => {
      toast.success("User created successfully");
      onClose();
      form.reset();
      void utils.user.list.invalidate();
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (data: CreateUserValues) => {
    // Clean up empty strings to null
    const cleanedData = {
      ...data,
      phone: data.phone || null,
      department: data.department || null,
      profile: data.profile
        ? {
            name: data.profile.name || null,
            phone: data.profile.phone || null,
            unit: data.profile.unit || null,
            segment: data.profile.segment || null,
            division: data.profile.division || null,
            legal_entity: data.profile.legal_entity || null,
            isActive: data.profile.isActive || true,
            role: data.profile.role || null,
          }
        : undefined,
    };

    createUser(cleanedData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
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
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
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
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
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
              <h3 className="text-lg font-medium">
                Business Information
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="profile.unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit</FormLabel>
                      <FormControl>
                        <Input
                          disabled={isPending}
                          placeholder="Unit A"
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
                      <FormLabel>Segment</FormLabel>
                      <FormControl>
                        <Input
                          disabled={isPending}
                          placeholder="Consumer"
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
                      <FormLabel>Division</FormLabel>
                      <FormControl>
                        <Input
                          disabled={isPending}
                          placeholder="Retail"
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
                          placeholder="Company Inc."
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
              <Button type="submit" disabled={isPending}>
                {isPending ? "Creating..." : "Create User"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
