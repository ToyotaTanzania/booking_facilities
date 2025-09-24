"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Plus, X, Clock, Users } from "lucide-react";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

const slotSchema = z.object({
  start: z.string().min(1, "Start time is required"),
  end: z.string().min(1, "End time is required"),
  size: z.coerce.number().min(1, "Capacity is required"),
});

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slots: z.array(slotSchema).min(1, "At least one slot is required"),
});

type CreateScheduleValues = z.infer<typeof formSchema>;

interface CreateScheduleProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateSchedule({
  isOpen,
  onClose,
}: CreateScheduleProps) {
  const utils = api.useUtils();
  
  const form = useForm<CreateScheduleValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      slots: [{ start: "07:00", end: "07:30", size: 1 }],
    },
  });

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      form.reset({
        name: "",
        slots: [{ start: "07:00", end: "07:30", size: 1 }],
      });
    }
  }, [isOpen, form]);

  const { mutate: createSchedule, isPending } = api.schedule.createWithSlots.useMutation({
    onSuccess: (data) => {
      toast.success("Schedule created successfully with all slots");
      onClose();
      form.reset();
      void utils.schedule.list.invalidate();
    },
    onError: (error) => {
      console.error("Failed to create schedule:", error);
      toast.error(error.message);
    },
  });

  // Remove the old createSlots mutation since it's no longer needed
  // const { mutate: createSlots, isPending: isCreatingSlots } = api.slots.createMultiple.useMutation({...});

  const onSubmit = (data: CreateScheduleValues) => {
    
    // Check if form is valid
    if (!form.formState.isValid) {
      toast.error("Please fix form validation errors");
      return;
    }
    
    // Validate that slots don't overlap
    const sortedSlots = [...data.slots].sort((a, b) => a.start.localeCompare(b.start));
    
    for (let i = 0; i < sortedSlots.length - 1; i++) {
      const currentSlot = sortedSlots[i];
      const nextSlot = sortedSlots[i + 1];
      if (currentSlot && nextSlot && currentSlot.end > nextSlot.start) {
        toast.error("Time slots cannot overlap. Please adjust the times.");
        return;
      }
    }

    // Validate that all slots have valid times
    const invalidSlots = data.slots.filter(slot => !slot.start || !slot.end);
    if (invalidSlots.length > 0) {
      toast.error("All time slots must have start and end times.");
      return;
    }

    createSchedule({ 
      name: data.name,
      slots: data.slots 
    });
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
    if (newSlots[index]) {
      newSlots[index] = { ...newSlots[index], [field]: value };
      form.setValue("slots", newSlots);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Schedule</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                <FormLabel>Time Slots</FormLabel>
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
                onClick={() => {
                  createSchedule({ name: "Test Schedule", slots: [{ start: "07:00", end: "07:30", size: 1 }] });
                }}
                disabled={isPending}
              >
                Test API
              </Button>
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
                {isPending ? "Creating..." : "Create Schedule"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
