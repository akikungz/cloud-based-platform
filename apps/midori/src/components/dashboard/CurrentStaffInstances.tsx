"use client";

import { useState, useEffect, useContext } from "react";
import { SectionCard, LoadingSpinner, AlertMessage, EmptyState } from "@midori/components/ui";
import { momoi_client } from "@midori/libs/momoi";
import { Database, User, Calendar, Cpu, MemoryStick, HardDrive, ExternalLink, Monitor, Globe } from "lucide-react";
import { formatDate } from "@midori/utils/format";
import { UserContext } from "@midori/contexts/user";

interface Instance {
  id: number;
  title: string;
  description: string;
  status: string;
  semester: string;
  course: string;
  cpus: number;
  memory: number;
  disk: number;
  ip_address: string | { ip: string } | null;
  created_at: Date;
  updated_at: Date;
  type?: string; // 'course' or 'project'
  user: {
    id: string;
    email: string;
    name: string;
  };
}

interface CurrentStaffInstancesProps {
  limit?: number;
}

export function CurrentStaffInstances({ limit = 10 }: CurrentStaffInstancesProps) {
  const [instances, setInstances] = useState<Instance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useContext(UserContext);

  useEffect(() => {
    const fetchInstances = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

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
          const allInstances = Array.isArray(instancesData) ? instancesData : [];
          
          // Filter instances to show only:
          // 1. Instances belonging to the current user
          // 2. Staff instances (type: 'personal', not 'course')
          const filteredInstances = allInstances.filter((instance: Instance) => {
            // Check if the instance belongs to the current user
            const instanceUserId = instance.user?.id?.toString();
            const currentUserId = user.id?.toString();
            const belongsToCurrentUser = instanceUserId === currentUserId;
            
            return belongsToCurrentUser;
          });
          
          setInstances(filteredInstances);
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
  }, [limit, user]);

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
      <SectionCard title="My Staff Instances">
        <LoadingSpinner size="lg" centered text="Loading your instances..." />
      </SectionCard>
    );
  }

  if (error) {
    return (
      <SectionCard title="My Staff Instances">
        <AlertMessage 
          type="error" 
          message={`Error loading instances: ${error}`}
          className="mb-4"
        />
      </SectionCard>
    );
  }

  if (instances.length === 0) {
    return (
      <SectionCard title="My Staff Instances">
        <EmptyState
          icon={Database}
          title="No staff instances found"
          description="You don't have any personal staff instances yet. Create one to get started."
        />
        <div className="text-center">
          <a
            href="/instances/staff/create"
            className="inline-flex items-center px-4 py-2 bg-vm-blue-600 text-white rounded-md hover:bg-vm-blue-700 transition-colors"
          >
            Create Instance
          </a>
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard 
      title="My Staff Instances"
      description="Your personal staff virtual machine instances (excluding student course instances)"
    >
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
                  
                  <button className="flex items-center space-x-1 text-vm-blue-600 hover:text-vm-blue-700">
                    <ExternalLink className="h-4 w-4" />
                    <span>View Details</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
