"use client";

import { useState } from "react";
import { StaffInstanceCreationForm } from "@midori/components/dashboard/StaffInstanceCreationForm";
import { PageHeader, SectionCard } from "@midori/components/ui";
import { RoleGuard } from "@midori/components/auth/RoleGuard";
import { Role } from "auth/utils/role";
import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";

export default function StaffCreateInstancePage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleInstanceCreated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <RoleGuard allowedRoles={[Role.Staff]}>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link 
            href="/instances"
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Instances
          </Link>
        </div>
      </div>
      
      {/* Page Header */}
      <PageHeader
        title="Create Instance"
        description="Create virtual machine instances directly without requiring student requests or semester locks"
      />

      {/* Info Card */}
      {/* <SectionCard 
        title="Staff Instance Creation" 
        description="Create virtual machine instances directly without requiring student requests or semester locks"
      >
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-sm font-medium">ℹ</span>
              </div>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Staff Override Capabilities
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>Create instances without requiring student requests</li>
                  <li>Bypass semester lock restrictions</li>
                  <li>Assign instances to any user in the system</li>
                  <li>Override normal approval workflows</li>
                  <li>Create instances for testing, demonstrations, or special cases</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </SectionCard> */}

      {/* Creation Form */}
      <StaffInstanceCreationForm 
        onInstanceCreated={handleInstanceCreated}
        key={refreshTrigger}
      />
      </div>
    </RoleGuard>
  );
}
