'use client'

import { useState } from "react";

interface RescheduleProps {
  event: any;
}

export const CancelEvent = ({ event }: RescheduleProps) => {

  const [count, setCount] = useState(0);
  return (
    <div className="p-4">
      <p className="mb-4">Count: {count}</p>
      <button
        className="px-4 py-2 bg-blue-500 text-white rounded"
        onClick={() => setCount(count + 1)}
      >
        Increment
      </button>
    </div>
  );
 }