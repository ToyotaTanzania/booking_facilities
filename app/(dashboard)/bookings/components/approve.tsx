'use client'

import { useState } from 'react';
import { type Booking } from "@/datatypes/types/booking";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar, HomeIcon, User, Clock, CheckCircle, XCircle, UserPlus } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { api } from '@/trpc/react';

interface ApproveProps {
  booking: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove?: (booking: Booking, reason?: string) => Promise<void>;
  onReject?: (booking: Booking, reason: string) => Promise<void>;
  onChangeUser?: (booking: Booking, newUserId: string, reason: string) => Promise<void>;
  availableUsers?: Array<{ id: string; name: string; email: string }>;
}

export const Approve = ({ 
  booking,
}: ApproveProps) => {

  if(!booking) return null;
  
  const [action, setAction] = useState<'approve' | 'reject' | 'change-user'>('approve');
  const [reason, setReason] = useState('');
  const [newUserId, setNewUserId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [ open, setOpen ] = useState(false);

  const { data: users } = api.auth.users.getAll.useQuery();
  const utils = api.useUtils();

  const { mutate: approveBooking } = api.booking.accept.useMutation({ 
    onSuccess: async () => {
      toast.success('Booking approved successfully');
      await utils.facility.getAllByDate.invalidate();
      setOpen(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  const { mutate: rejectBooking } = api.booking.reject.useMutation({ 
    onSuccess: async () => {
      toast.success('Booking rejected successfully');
      await utils.facility.getAllByDate.invalidate();
      setOpen(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  const { mutate: changeUserBooking } = api.booking.changeUser.useMutation({ 
    onSuccess: async () => {
      toast.success('Booking user changed successfully');
      await utils.facility.getAllByDate.invalidate();
      setOpen(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = async () => {
    if (action === 'reject' && !reason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    if (action === 'change-user' && (!newUserId || !reason.trim())) {
      toast.error('Please select a new user and provide a reason');
      return;
    }

    setIsLoading(true);


    try {
      switch (action) {
        case 'approve':
          console.log('Approving booking:', { booking, reason });
          approveBooking({
            slot: booking.slot as number,
            facility: booking.facility as number,
            date: booking.date as string,
            schedule: booking.schedule as number,
            comment: reason.trim() || undefined,
          });
          break;
        case 'reject':
          rejectBooking({
            slot: booking.slot as number,
            facility: booking.facility as number,
            date: booking.date as string,
            comment: reason.trim(),
          });
          break;
        case 'change-user':
          changeUserBooking({
            slot: booking.slot as number,
            facility: booking.facility as number,
            date: booking.date as string,
            user: newUserId,
            comment: reason.trim(),
          });
          break;
      }
      
      // Reset form and close modal
      setAction('approve');
      setReason('');
      setNewUserId('');
      setOpen(false);
    } catch (error) {
      console.error('Error processing booking action:', error);
      toast.error('Failed to process action. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

 
  const handleCancel = () => {
    setAction('approve');
    setReason('');
    setNewUserId('');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild> 
          <Button variant="outline" onClick={() => setOpen(true)}> Confirm </Button>  
      </DialogTrigger>

      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Booking Management
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-6">
          {/* Booking Information */}
          <div className="space-y-3">
            <h3 className="font-medium text-lg">Booking Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Date: {format(new Date(booking.date as string), "EEEE, MMMM d, yyyy")}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Slot ID: {booking.slot as number}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <HomeIcon className="h-4 w-4" />
                <span>Facility ID: {booking.facility as number}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="h-4 w-4" />
                <span>User ID: {booking.description as string ?? 'Unknown'}</span>
              </div>
            </div>
            
            {/* Current Status */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Status:</span>
              <Badge 
                variant={booking.status as string === 'pending' ? 'secondary' : 'default'}
                className={
                  booking.status as string === 'pending' 
                    ? 'bg-yellow-100 text-yellow-800 border-yellow-200' 
                    : ''
                }
              >
                {booking.status as string === 'pending' ? 'Pending Approval' : booking.status as string}
              </Badge>
            </div>
          </div>

          {/* Action Selection */}
          <div className="space-y-3">
            <h3 className="font-medium text-lg">Select Action</h3>
            <div className="grid grid-cols-3 gap-3">
              <Button
                variant={action === 'approve' ? 'default' : 'outline'}
                onClick={() => setAction('approve')}
                className="h-auto p-3 flex flex-col items-center gap-2"
              >
                <CheckCircle className="h-5 w-5" />
                <span className="text-sm">Approve</span>
              </Button>
              <Button
                variant={action === 'reject' ? 'default' : 'outline'}
                onClick={() => setAction('reject')}
                className="h-auto p-3 flex flex-col items-center gap-2"
              >
                <XCircle className="h-5 w-5" />
                <span className="text-sm">Reject</span>
              </Button>
              <Button
                variant={action === 'change-user' ? 'default' : 'outline'}
                onClick={() => setAction('change-user')}
                className="h-auto p-3 flex flex-col items-center gap-2"
              >
                <UserPlus className="h-5 w-5" />
                <span className="text-sm">Change User</span>
              </Button>
            </div>
          </div>

          {/* Change User Selection */}
          {action === 'change-user' && (
            <div className="space-y-3">
              <Label htmlFor="new-user">Select New User</Label>
              <Select value={newUserId} onValueChange={setNewUserId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a user..." />
                </SelectTrigger>
                <SelectContent>
                  {users?.map((user) => (
                    <SelectItem key={user.userid as string} value={user.userid as string || '' }>
                      {user.name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Reason/Description Textarea */}
          <div className="space-y-3">
            <Label htmlFor="reason">
              {action === 'approve' ? 'Description (Optional)' : 'Reason (Required)'}
            </Label>
            <Textarea
              id="reason"
              placeholder={
                action === 'approve' 
                  ? 'Add any additional notes or description...'
                  : action === 'reject'
                  ? 'Please provide a reason for rejection...'
                  : 'Please provide a reason for changing the user...'
              }
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              className="resize-none"
            />
            {action !== 'approve' && (
              <p className="text-xs text-muted-foreground">
                This reason will be visible to the user and recorded in the system.
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isLoading}
            variant={
              action === 'approve' ? 'default' : 
              action === 'reject' ? 'destructive' : 
              'default'
            }
          >
            {isLoading ? 'Processing...' : 
              action === 'approve' ? 'Approve Booking' :
              action === 'reject' ? 'Reject Booking' :
              'Change User'
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};