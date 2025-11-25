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
import { api } from "@/trpc/react";

const formSchema = z.object({
  originalName: z.string().optional(), // Hidden field for update operation
  name: z.string().min(1, "Name is required"),
  address: z.string().nullable(),
});

type LocationFormValues = z.infer<typeof formSchema>;

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: {
    name: string;
    address: string | null;
  } | null;
}

export function LocationModal({
  isOpen,
  onClose,
  initialData,
}: LocationModalProps) {
  const utils = api.useUtils();
  
  const form = useForm<LocationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      originalName: initialData?.name,
      name: initialData?.name ?? "",
      address: initialData?.address ?? "",
    },
  });

  const { mutate: createLocation, isPending: isCreating } = api.location.create.useMutation({
    onSuccess: () => {
      toast.success("Location created successfully");
      onClose();
      form.reset();
      void utils.location.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const { mutate: updateLocation, isPending: isUpdating } = api.location.update.useMutation({
    onSuccess: () => {
      toast.success("Location updated successfully");
      onClose();
      form.reset();
      void utils.location.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (data: LocationFormValues) => {
    if (initialData) {
      // Use originalName for the update query
      updateLocation({
        name: data.originalName!, // We know this exists for updates
        data: {
          name: data.name, // Allow updating the name
          address: data.address,
        },
      });
    } else {
      createLocation({
        name: data.name,
        address: data.address,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Location" : "Create Location"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Hidden field for original name */}
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
                      disabled={isCreating || isUpdating}
                      placeholder="Location name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isCreating || isUpdating}
                      placeholder="Location address"
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
                disabled={isCreating || isUpdating}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isCreating || isUpdating}
              >
                {initialData ? "Save changes" : "Create"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}