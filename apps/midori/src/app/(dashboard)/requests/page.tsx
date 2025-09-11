"use client";

import { useState } from 'react';
import { StudentRequestForm } from '@midori/components/dashboard/StudentRequestForm';
import { RequestManager } from '@midori/components/dashboard/RequestManager';

export default function RequestsPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleRequestSubmitted = () => {
    // Trigger a refresh of the request manager
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Request Management</h1>
        <p className="text-gray-600 mt-2">
          Create new instance requests and manage your existing requests
        </p>
      </div>

      <StudentRequestForm onRequestSubmitted={handleRequestSubmitted} />
      <RequestManager refreshTrigger={refreshTrigger} />
    </div>
  );
}