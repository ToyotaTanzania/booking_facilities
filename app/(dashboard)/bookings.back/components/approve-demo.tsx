"use client";

import { useState } from 'react';
import { Approve } from './approve';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, UserPlus } from 'lucide-react';

// Sample booking data
const sampleBooking = {
  schedule: 1,
  status: "pending",
  approved_at: null,
  slot: 10,
  description: "Team meeting for project planning",
  approved_by: null,
  facility: 1,
  date: "2025-08-25",
  user: "user-123",
  created_at: "2025-08-25T06:38:58.256721+00:00",
  updated_at: "2025-08-25T06:38:58.256721+00:00"
};

// Sample available users for user change
const sampleUsers = [
  { id: "user-123", name: "John Doe", email: "john@example.com" },
  { id: "user-456", name: "Jane Smith", email: "jane@example.com" },
  { id: "user-789", name: "Bob Johnson", email: "bob@example.com" },
];

export function ApproveDemo() {
  const [showModal, setShowModal] = useState(false);

  const handleApprove = async (booking: any, reason?: string) => {
    // TODO: Implement actual approval logic
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
  };

  const handleReject = async (booking: any, reason: string) => {
    // TODO: Implement actual rejection logic
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
  };

  const handleChangeUser = async (booking: any, newUserId: string, reason: string) => {
 // TODO: Implement actual user change logic
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-4">Booking Approval Demo</h1>
        <p className="text-muted-foreground">
          This demo shows the booking approval modal with options to approve, reject, or change users.
        </p>
      </div>

      {/* Sample Booking Display */}
      <div className="border rounded-lg p-4 space-y-3">
        <h2 className="text-lg font-semibold">Sample Booking</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Date:</span> {sampleBooking.date}
          </div>
          <div>
            <span className="font-medium">Slot ID:</span> {sampleBooking.slot}
          </div>
          <div>
            <span className="font-medium">Facility ID:</span> {sampleBooking.facility}
          </div>
          <div>
            <span className="font-medium">User ID:</span> {sampleBooking.user}
          </div>
          <div>
            <span className="font-medium">Status:</span>
            <Badge variant="secondary" className="ml-2 bg-yellow-100 text-yellow-800 border-yellow-200">
              {sampleBooking.status}
            </Badge>
          </div>
          <div>
            <span className="font-medium">Description:</span> {sampleBooking.description}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button 
          onClick={() => setShowModal(true)}
          className="bg-green-600 hover:bg-green-700"
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Open Approval Modal
        </Button>
      </div>

      {/* Approval Modal */}
      <Approve
        booking={sampleBooking}
        open={showModal}
        onOpenChange={setShowModal}
        onApprove={handleApprove}
        onReject={handleReject}
        onChangeUser={handleChangeUser}
        availableUsers={sampleUsers}
      />

      {/* Instructions */}
      <div className="border rounded-lg p-4 bg-muted/30">
        <h3 className="font-medium mb-2">How to use:</h3>
        <ul className="text-sm space-y-1 text-muted-foreground">
          <li>• Click "Open Approval Modal" to see the approval interface</li>
          <li>• Choose between Approve, Reject, or Change User actions</li>
          <li>• Add reasons/descriptions as required</li>
          <li>• Select a new user if changing user assignment</li>
          <li>• Check the console for action logs</li>
        </ul>
      </div>
    </div>
  );
}
