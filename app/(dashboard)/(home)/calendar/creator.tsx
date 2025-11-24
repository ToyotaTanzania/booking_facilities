"use client";

import { useDisclosure } from "@/hooks/use-disclosure";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { useSession } from "next-auth/react";
import { Input } from "@/src/components/ui/input";
import { api } from "@/trpc/react";
import { toast } from "sonner";

import { eventSchema, type TEventFormData } from "@/calendar/schemas";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from "@/src/components/kibo-ui/combobox";

import {
  Form,
  FormField,
  FormLabel,
  FormItem,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JSONTree } from "react-json-tree";

type IProps = {
  location: string;
  building: {
    id: number;
    name: string;
  };
  facility: {
    id: number;
    name: string;
  };
  date?: Date | string;
  bookings?: any;
  schedule?: any;
  slots?: any;
};

const EventCreator = ({ data: props }: any) => {
  const { isOpen, onOpen, onClose, onToggle } = useDisclosure();

  const { facility, building, location } = props;

  const form = useForm<TEventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      location: props.location,
      building: props.building.id,
      room: props.facility.id,
      title: "",
      slots: [],
      date: props.date,
    },
  });

  const onSubmit = (_values: TEventFormData) => {
    console.log(_values);
    // const facility = facilities?.find(facility => facility.id === Number(_values.room))
    // createBooking({
    //   ..._values,
    //   schedule: facility.schedule,
    // });
    // form.reset()
  };

  return (
    <div>
      <AlertDialog open={isOpen} onOpenChange={onToggle}>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" className="h-12 w-12 cursor-pointer">
            <Plus />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              <div>
                <div>{facility.name}</div>
                <div className="text-muted-foreground text-sm">
                  {location} - {building.name}
                </div>
              </div>
            </AlertDialogTitle>
            <AlertDialogDescription>
              <Form {...form}>
                <form
                  id="event-form"
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="grid gap-4 py-4"
                >
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input type="text" placeholder="title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <JSONTree data={props} />

                  <div className="flex w-full justify-end gap-6">
                    <Button
                      type="button"
                      className="cursor-pointer"
                      variant="outline"
                      onClick={() => {
                        form.reset();
                        onClose();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      form="event-form"
                      className="cursor-pointer"
                      type="submit"
                    >
                      Confirm
                    </Button>
                  </div>
                </form>
              </Form>
            </AlertDialogDescription>
          </AlertDialogHeader>
          {/* <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>Create</AlertDialogAction>
          </AlertDialogFooter> */}
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EventCreator;
