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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Heading } from "@/components/ui/heading";
import { api } from "@/trpc/react";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  location: z.string().min(1, "Location is required"),
});

type BuildingFormValues = z.infer<typeof formSchema>;

interface BuildingFormProps {
  initialData?: {
    id: number;
    name: string | null;
    location: string | null;
  } | null;
}

export function BuildingForm({ initialData }: BuildingFormProps) {
  const router = useRouter();
  const { data: locations } = api.location.list.useQuery();

  const form = useForm<BuildingFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      location: initialData?.location || "",
    },
  });

  const { mutate: createBuilding, isLoading: isCreating } = api.building.create.useMutation({
    onSuccess: () => {
      toast.success("Building created successfully");
      router.push("/dashboard/buildings");
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const { mutate: updateBuilding, isLoading: isUpdating } = api.building.update.useMutation({
    onSuccess: () => {
      toast.success("Building updated successfully");
      router.push("/dashboard/buildings");
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const { mutate: deleteBuilding, isLoading: isDeleting } = api.building.delete.useMutation({
    onSuccess: () => {
      toast.success("Building deleted successfully");
      router.push("/dashboard/buildings");
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (data: BuildingFormValues) => {
    if (initialData) {
      updateBuilding({
        id: initialData.id,
        data: {
          name: data.name,
          location: data.location,
        },
      });
    } else {
      createBuilding(data);
    }
  };

  const onDelete = () => {
    if (initialData) {
      deleteBuilding(initialData.id);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={initialData ? "Edit Building" : "Create Building"}
          description={initialData ? "Edit a building" : "Add a new building"}
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
                      disabled={isCreating || isUpdating}
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
                    disabled={isCreating || isUpdating}
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          defaultValue={field.value}
                          placeholder="Select a location"
                        />
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
