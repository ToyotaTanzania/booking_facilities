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
import { useEffect } from "react";

const formSchema = z.object({
  originalName: z.string(),
  name: z.string().min(1, "Name is required"),
  address: z.string().nullable(),
});

type UpdateLocationValues = z.infer<typeof formSchema>;

interface UpdateLocationProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    name: string;
    address: string | null;
  };
}

export function UpdateLocation({
  isOpen,
  onClose,
  data,
}: UpdateLocationProps) {
  const utils = api.useUtils();
  
  const form = useForm<UpdateLocationValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      originalName: data.name,
      name: data.name,
      address: data.address,
    },
  });

  // Update form when data changes
  useEffect(() => {
    form.reset({
      originalName: data.name,
      name: data.name,
      address: data.address,
    });
  }, [form, data]);

  const { mutate: updateLocation, isPending } = api.location.update.useMutation({
    onSuccess: () => {
      toast.success("Location updated successfully");
      onClose();
      void utils.location.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (values: UpdateLocationValues) => {
    updateLocation({
      name: values.originalName,
      data: {
        name: values.name,
        address: values.address,
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Location</DialogTitle>
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
                      disabled={isPending}
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
