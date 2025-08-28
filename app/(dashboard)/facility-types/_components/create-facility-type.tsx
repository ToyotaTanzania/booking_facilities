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

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().nullable(),
});

type CreateFacilityTypeValues = z.infer<typeof formSchema>;

interface CreateFacilityTypeProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateFacilityType({
  isOpen,
  onClose,
}: CreateFacilityTypeProps) {
  const utils = api.useUtils();
  
  const form = useForm<CreateFacilityTypeValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const { mutate: createFacilityType, isPending } = api.facilityType.create.useMutation({
    onSuccess: () => {
      toast.success("Facility type created successfully");
      onClose();
      form.reset();
      void utils.facilityType.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (data: CreateFacilityTypeValues) => {
    createFacilityType(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Facility Type</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                Create
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
