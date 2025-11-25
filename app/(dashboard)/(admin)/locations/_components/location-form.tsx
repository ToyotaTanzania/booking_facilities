"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash } from "lucide-react";
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
import { Separator } from "@/components/ui/separator";
import { Heading } from "@/components/ui/heading";
import { api } from "@/trpc/react";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().nullable(),
});

type LocationFormValues = z.infer<typeof formSchema>;

interface LocationFormProps {
  initialData?: {
    name: string;
    address: string | null;
  } | null;
}

export function LocationForm({ initialData }: LocationFormProps) {
  const router = useRouter();

  const utils = api.useUtils();

  const form = useForm<LocationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ?? {
      name: "",
      address: "",
    },
  });

  const { mutate: createLocation, isPending: isCreating } = api.location.create.useMutation({
    onSuccess: () => {
      toast.success("Location created successfully");
      router.push("/dashboard/locations");
      void utils.location.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const { mutate: updateLocation, isPending: isUpdating } = api.location.update.useMutation({
    onSuccess: () => {
      toast.success("Location updated successfully");
      router.push("/dashboard/locations");
      void utils.location.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const { mutate: deleteLocation, isPending: isDeleting } = api.location.delete.useMutation({
    onSuccess: () => {
      toast.success("Location deleted successfully");
      router.push("/dashboard/locations");
      void utils.location.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (data: LocationFormValues) => {
    if (initialData) {
      updateLocation({
        name: initialData.name,
        data: {
          address: data.address,
        },
      });
    } else {
      createLocation(data);
    }
  };

  const onDelete = () => {
    if (initialData) {
      deleteLocation(initialData.name);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={initialData ? "Edit Location" : "Create Location"}
          description={initialData ? "Edit a location" : "Add a new location"}
        />
        {initialData && (
          <Button
            disabled={isDeleting}
            variant="destructive"
            size="sm"
            onClick={onDelete}
          >
            <Trash className="h-4 w-4" />
          </Button>
        )}
      </div>
      <Separator />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">
          <div className="grid grid-cols-1 gap-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isCreating || isUpdating || !!initialData}
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
          </div>
          <Button
            disabled={isCreating || isUpdating}
            className="ml-auto"
            type="submit"
          >
            {initialData ? "Save changes" : "Create"}
          </Button>
        </form>
      </Form>
    </>
  );
}
