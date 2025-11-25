"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { Plus, X, Clock, Users } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import type { ScheduleColumn } from "./schedules-table";

const slotSchema = z.object({
  id: z.number().optional(),
  start: z.string().min(1, "Start time is required"),
  end: z.string().min(1, "End time is required"),
  size: z.coerce.number().min(1, "Capacity is required"),
});

const formSchema = z.object({
  id: z.number(),
  name: z.string().min(1, "Name is required"),
  slots: z.array(slotSchema).min(1, "At least one slot is required"),
});

type UpdateScheduleValues = z.infer<typeof formSchema>;

interface UpdateScheduleProps {
  isOpen: boolean;
  onClose: () => void;
  data: ScheduleColumn;
}

export function UpdateSchedule({
  isOpen,
  onClose,
  data,
}: UpdateScheduleProps) {
  const utils = api.useUtils();
  
  const form = useForm<UpdateScheduleValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: data.id,
      name: data.name,
      slots: data.slots?.map(slot => ({
        id: slot.id,
        start: slot.start,
        end: slot.end,
        size: slot.size,
      })) || [{ start: "", end: "", size: 1 }],
    },
  });

  // Update form when data changes
  useEffect(() => {
    form.reset({
      id: data.id,
      name: data.name,
      slots: data.slots?.map(slot => ({
        id: slot.id,
        start: slot.start,
        end: slot.end,
        size: slot.size,
      })) || [{ start: "", end: "", size: 1 }],
    });
  }, [form, data]);

  const { mutate: updateSchedule, isPending } = api.schedule.update.useMutation({
    onSuccess: (data) => {
      toast.success("Schedule updated successfully");
      onClose();
      form.reset();
      void utils.schedule.list.invalidate();
    },
    onError: (error) => {
      console.error("Failed to update schedule:", error);
      toast.error(error.message);
    },
  });

  const onSubmit = (values: UpdateScheduleValues) => {
    updateSchedule({
      id: data.id,
      name: values.name,
      slots: values.slots,
    });
    
    // TODO: Handle slot updates - this would require more complex logic
    // to sync existing slots with new ones
    toast.info("Schedule name updated. Slot management coming soon.");
  };

  const slots = form.watch("slots");

  const addSlot = () => {
    form.setValue("slots", [...slots, { start: "", end: "", size: 1 }]);
  };

  const removeSlot = (index: number) => {
    if (slots.length > 1) {
      form.setValue("slots", slots.filter((_, i) => i !== index));
    }
  };

  const updateSlot = (index: number, field: keyof typeof slots[0], value: string | number) => {
    const newSlots = [...slots];
    newSlots[index] = { ...newSlots[index], [field]: value };
    form.setValue("slots", newSlots);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Schedule</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <input
              type="hidden"
              {...form.register("id")}
            />
            
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Schedule Name</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isPending}
                      placeholder="e.g., Default Slots, Morning Schedule"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <FormLabel>Time Slots (Read-only for now)</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addSlot}
                  disabled={isPending}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Slot
                </Button>
              </div>

              <div className="space-y-3">
                {slots.map((slot, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="flex-1 grid grid-cols-3 gap-3">
                      <div>
                        <FormLabel className="text-xs">Start Time</FormLabel>
                        <Input
                          type="time"
                          value={slot.start}
                          onChange={(e) => updateSlot(index, "start", e.target.value)}
                          disabled={isPending}
                        />
                      </div>
                      <div>
                        <FormLabel className="text-xs">End Time</FormLabel>
                        <Input
                          type="time"
                          value={slot.end}
                          onChange={(e) => updateSlot(index, "end", e.target.value)}
                          disabled={isPending}
                        />
                      </div>
                      <div>
                        <FormLabel className="text-xs">Capacity</FormLabel>
                        <Input
                          type="number"
                          min="1"
                          value={slot.size}
                          onChange={(e) => updateSlot(index, "size", parseInt(e.target.value) || 1)}
                          disabled={isPending}
                        />
                      </div>
                    </div>
                    {slots.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeSlot(index)}
                        disabled={isPending}
                        className="h-8 w-8"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              {form.formState.errors.slots && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.slots.message}
                </p>
              )}
            </div>

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
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
