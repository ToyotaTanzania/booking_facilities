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
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/trpc/react";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useState } from "react";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.string().min(1, "Type is required"),
  building: z.string().min(1, "Building is required"),
  description: z.string().nullable(),
  amenities: z.array(z.string()).nullable(),
  capacity: z.coerce.number().min(1, "Capacity is required"),
  images: z.any().nullable(),
});

type CreateFacilityValues = z.infer<typeof formSchema>;

interface CreateFacilityProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateFacility({
  isOpen,
  onClose,
}: CreateFacilityProps) {
  const utils = api.useUtils();
  const { data: buildings } = api.building.list.useQuery();
  const { data: facilityTypes } = api.facilityType.list.useQuery();
  
  const form = useForm<CreateFacilityValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: "",
      building: "",
      description: "",
      amenities: [],
      capacity: 0,
      images: null,
    },
  });

  const { mutate: createFacility, isPending } = api.facility.create.useMutation({
    onSuccess: () => {
      toast.success("Facility created successfully");
      onClose();
      form.reset();
      void utils.facility.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (data: CreateFacilityValues) => {
    createFacility({
      ...data,
      type: data.type,
      building: parseInt(data.building),
    });
  };

  // Handle amenities
  const [newAmenity, setNewAmenity] = useState("");
  const amenities = form.watch("amenities") ?? [];

  const addAmenity = () => {
    if (!newAmenity.trim()) return;
    form.setValue("amenities", [...amenities, newAmenity.trim()]);
    setNewAmenity("");
  };

  const removeAmenity = (amenity: string) => {
    form.setValue(
      "amenities",
      amenities.filter((a) => a !== amenity)
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Facility</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isPending}
                        placeholder="Facility name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacity</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isPending}
                        type="number"
                        placeholder="Capacity"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select
                      disabled={isPending}
                      onValueChange={field.onChange}
                      value={field.value}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {facilityTypes?.map((type: any) => (
                          <SelectItem
                            key={type.name}
                            value={type.name}
                          >
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="building"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Building</FormLabel>
                    <Select
                      disabled={isPending}
                      onValueChange={field.onChange}
                      value={field.value}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a building" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {buildings?.map((building) => (
                          <SelectItem
                            key={building.id}
                            value={building.id.toString()}
                          >
                            {building.name} ({building.location})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      disabled={isPending}
                      placeholder="Facility description"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amenities"
              render={() => (
                <FormItem>
                  <FormLabel>Amenities</FormLabel>
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        value={newAmenity}
                        onChange={(e) => setNewAmenity(e.target.value)}
                        placeholder="Add amenity"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addAmenity();
                          }
                        }}
                      />
                      <Button
                        type="button"
                        onClick={addAmenity}
                      >
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {amenities.map((amenity) => (
                        <Badge
                          key={amenity}
                          variant="secondary"
                          className="gap-1"
                        >
                          {amenity}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 p-0"
                            onClick={() => removeAmenity(amenity)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  </div>
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
                Create
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
