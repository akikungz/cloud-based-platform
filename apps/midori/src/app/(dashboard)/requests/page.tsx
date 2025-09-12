"use client";

import { useState } from 'react';
import { StudentRequestForm } from '@midori/components/dashboard/StudentRequestForm';
import { RequestManager } from '@midori/components/dashboard/RequestManager';
import { PageHeader } from '@midori/components/ui';

export default function RequestsPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleRequestSubmitted = () => {
    // Trigger a refresh of the request manager
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Request Management"
        description="Create new instance requests and manage your existing requests"
      />

      <StudentRequestForm onRequestSubmitted={handleRequestSubmitted} />
      <RequestManager refreshTrigger={refreshTrigger} />
    </div>
  );
}