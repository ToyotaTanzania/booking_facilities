"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
import { useEffect } from "react";
import type { FacilityTypeColumn } from "./facility-types-table";

const formSchema = z.object({
  originalName: z.string(),
  name: z.string().min(1, "Name is required"),
  description: z.string().nullable(),
});

type UpdateFacilityTypeValues = z.infer<typeof formSchema>;

interface UpdateFacilityTypeProps {
  isOpen: boolean;
  onClose: () => void;
  data: FacilityTypeColumn;
}

export function UpdateFacilityType({
  isOpen,
  onClose,
  data,
}: UpdateFacilityTypeProps) {
  const utils = api.useUtils();
  
  const form = useForm<UpdateFacilityTypeValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      originalName: data.name,
      name: data.name,
      description: data.description ?? "",
    },
  });

  // Update form when data changes
  useEffect(() => {
    form.reset({
      originalName: data.name,
      name: data.name,
      description: data.description ?? "",
    });
  }, [form, data]);

  const { mutate: updateFacilityType, isPending } = api.facilityType.update.useMutation({
    onSuccess: () => {
      toast.success("Facility type updated successfully");
      onClose();
      void utils.facilityType.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (values: UpdateFacilityTypeValues) => {
    updateFacilityType({
      originalName: values.originalName,
      data: {
        name: values.name,
        description: values.description,
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Facility Type</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <input
              type="hidden"
              {...form.register("originalName")}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isPending}
                      placeholder="Facility type name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      disabled={isPending}
                      placeholder="Facility type description"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-x-2">
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
                Save changes
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
