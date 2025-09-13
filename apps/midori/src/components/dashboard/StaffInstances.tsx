"use client";

import { useState, useEffect } from "react";
import { SectionCard, LoadingSpinner, AlertMessage, EmptyState } from "@midori/components/ui";
import { momoi_client } from "@midori/libs/momoi";
import { Database, User, Calendar, Cpu, MemoryStick, HardDrive, ExternalLink } from "lucide-react";
import { formatDate } from "@midori/utils/format";
import Link from "next/link";
import { Button } from "@mui/material";

interface Instance {
  id: number;
  title: string;
  description: string;
  status: string;
  type: string;
  semester: string;
  course: string;
  cpus: number;
  memory: number;
  disk: number;
  ip_address: string | { ip: string } | null;
  created_at: Date;
  updated_at: Date;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

interface StaffInstancesProps {
  limit?: number;
  dashboard?: boolean;
}

export function StaffInstances({ limit = 10, dashboard = false }: StaffInstancesProps) {
  const [instances, setInstances] = useState<Instance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInstances = async () => {
      try {
        const result = await momoi_client.api.v1.staff.instances.get({
          query: {
            take: limit
          }
        });

        if (result.error) {
          setError(result.error.value.message || 'Failed to fetch instances');
        } else if (result.data) {
          const instancesData = result.data?.data?.instances || result.data?.data || [];
          setInstances(Array.isArray(instancesData) ? instancesData : []);
        } else {
          setError('No data received');
        }
      } catch (err) {
        console.error("Error fetching instances:", err);
        setError("Failed to fetch instances");
      } finally {
        setLoading(false);
      }
    };

    fetchInstances();
  }, [limit]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'running':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'stopped':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'running':
        return '🟢';
      case 'stopped':
        return '🔴';
      case 'pending':
        return '🟡';
      default:
        return '⚪';
    }
  };

  if (loading) {
    return (
      <div className="w-full bg-white p-6 rounded-lg shadow-md">
        {dashboard && (
          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <Database className="text-vm-blue-600 w-6 h-6" />
              <div>
                <h3 className="text-2xl font-semibold">Recent Instances</h3>
                <p className="text-vm-blue-600 text-sm">Latest virtual machine instances across the platform</p>
              </div>
            </div>
            <Link href="/instances" passHref>
              <Button variant="outlined" color="secondary" size="small">
                View All
              </Button>
            </Link>
          </div>
        )}
        <LoadingSpinner size="lg" centered text="Loading instances..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-white p-6 rounded-lg shadow-md">
        {dashboard && (
          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <Database className="text-vm-blue-600 w-6 h-6" />
              <div>
                <h3 className="text-2xl font-semibold">Recent Instances</h3>
                <p className="text-vm-blue-600 text-sm">Latest virtual machine instances across the platform</p>
              </div>
            </div>
            <Link href="/instances" passHref>
              <Button variant="outlined" color="secondary" size="small">
                View All
              </Button>
            </Link>
          </div>
        )}
        <AlertMessage 
          type="error" 
          message={`Error loading instances: ${error}`}
          className="mb-4"
        />
      </div>
    );
  }

  if (instances.length === 0) {
    return (
      <div className="w-full bg-white p-6 rounded-lg shadow-md">
        {dashboard && (
          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <Database className="text-vm-blue-600 w-6 h-6" />
              <div>
                <h3 className="text-2xl font-semibold">Recent Instances</h3>
                <p className="text-vm-blue-600 text-sm">Latest virtual machine instances across the platform</p>
              </div>
            </div>
            <Link href="/instances" passHref>
              <Button variant="outlined" color="secondary" size="small">
                View All
              </Button>
            </Link>
          </div>
        )}
        <EmptyState
          icon={Database}
          title="No instances found"
          description="No virtual machine instances are currently available."
        />
      </div>
    );
  }

  return (
    <div className="w-full bg-white p-6 rounded-lg shadow-md">
      {dashboard && (
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <Database className="text-vm-blue-600 w-6 h-6" />
            <div>
              <h3 className="text-2xl font-semibold">Recent Instances</h3>
              <p className="text-vm-blue-600 text-sm">Latest virtual machine instances across the platform</p>
            </div>
          </div>
          <Link href="/instances" passHref>
            <Button variant="outlined" color="primary" size="small">
              View All
            </Button>
          </Link>
        </div>
      )}
      
      {!dashboard && (
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-vm-blue-900 mb-2">All Instances</h3>
          <p className="text-vm-blue-600">Manage all virtual machine instances</p>
        </div>
      )}
      
      <div className="space-y-4">
        {instances.map((instance) => (
          <div
            key={instance.id}
            className="border border-gray-200 rounded-lg p-4 bg-white hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {instance.title}
                  </h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(instance.status)}`}>
                    <span className="mr-1">{getStatusIcon(instance.status)}</span>
                    {instance.status}
                  </span>
                </div>
                
                {instance.description && (
                  <p className="text-gray-600 mb-3">{instance.description}</p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <User className="h-4 w-4" />
                    <span>{instance.user.name}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>{instance.semester}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Cpu className="h-4 w-4" />
                    <span>{instance.cpus} CPU{instance.cpus !== 1 ? 's' : ''}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MemoryStick className="h-4 w-4" />
                    <span>{instance.memory}MB RAM</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    <span>Created: {formatDate(instance.created_at)}</span>
                    {instance.ip_address && (
                      <span>IP: {typeof instance.ip_address === 'string' ? instance.ip_address : instance.ip_address.ip}</span>
                    )}
                  </div>
                  
                  {!dashboard && (
                    <button className="flex items-center space-x-1 text-vm-blue-600 hover:text-vm-blue-700">
                      <ExternalLink className="h-4 w-4" />
                      <span>View Details</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
