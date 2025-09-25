'use client'

import { useDisclosure } from '@/hooks/use-disclosure'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { BookingForm } from '../../bookings.back/components/booking'
import { AddEventDialog } from '@/calendar/components/dialogs/add-event-dialog'
import { Plus } from 'lucide-react'

export function CreateBookingDialog() {
  const { isOpen, onToggle } = useDisclosure()

  return (
    <Dialog open={isOpen} onOpenChange={onToggle}>
      <DialogTrigger asChild>
        <Button size="sm">Create Booking</Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>Create Booking</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* <BookingForm /> */}
          <AddEventDialog>
            <Button className="w-full sm:w-auto">
              <Plus />
              Book Event
            </Button>
        </AddEventDialog>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default CreateBookingDialog
