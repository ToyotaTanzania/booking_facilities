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
import { BookingForm } from '../../bookings/components/booking'

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
          <BookingForm />
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default CreateBookingDialog
