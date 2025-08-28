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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { api } from "@/trpc/react";
import { useEffect } from "react";

const formSchema = z.object({
  id: z.number(),
  name: z.string().min(1, "Name is required"),
  location: z.string().min(1, "Location is required"),
});

type UpdateBuildingValues = z.infer<typeof formSchema>;

interface UpdateBuildingProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    id: number;
    name: string | null;
    location: string | null;
  };
}

export function UpdateBuilding({
  isOpen,
  onClose,
  data,
}: UpdateBuildingProps) {
  const utils = api.useUtils();
  const { data: locations } = api.location.list.useQuery();
  
  const form = useForm<UpdateBuildingValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: data.id,
      name: data.name ?? "",
      location: data.location ?? "",
    },
  });

  // Update form when data changes
  useEffect(() => {
    form.reset({
      id: data.id,
      name: data.name ?? "",
      location: data.location ?? "",
    });
  }, [form, data]);

  const { mutate: updateBuilding, isPending } = api.building.update.useMutation({
    onSuccess: () => {
      toast.success("Building updated successfully");
      onClose();
      void utils.building.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (values: UpdateBuildingValues) => {
    updateBuilding({
      id: values.id,
      data: {
        name: values.name,
        location: values.location,
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Building</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <input
              type="hidden"
              {...form.register("id")}
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
                      placeholder="Building name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <Select
                    disabled={isPending}
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a location" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {locations?.map((location) => (
                        <SelectItem
                          key={location.name}
                          value={location.name}
                        >
                          {location.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
