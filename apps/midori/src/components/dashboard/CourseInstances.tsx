"use client";

import { useState, useEffect } from "react";
import { SectionCard, LoadingSpinner, AlertMessage, EmptyState } from "@midori/components/ui";
import { momoi_client } from "@midori/libs/momoi";
import { Database, Users, Calendar, Cpu, MemoryStick, HardDrive, ExternalLink, Monitor, Globe, BookOpen } from "lucide-react";
import { formatDate } from "@midori/utils/format";

interface CourseInstance {
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
  created_at: string;
  updated_at: string;
  user: {
    id: number;
    email: string;
    name: string;
  };
  // Additional course-specific fields
  course_id?: string;
  student_count?: number;
}

interface CourseInstancesProps {
  limit?: number;
}

export function CourseInstances({ limit = 10 }: CourseInstancesProps) {
  const [instances, setInstances] = useState<CourseInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInstances = async () => {
      try {
        const result = await momoi_client.api.v1.staff.instances.get({
          query: {
            take: limit.toString()
          }
        });

        if (result.error) {
          setError(result.error.message || 'Failed to fetch instances');
        } else if (result.data) {
          const instancesData = result.data?.data?.instances || result.data?.data || [];
          // Filter for course instances (instances that have a course assigned)
          const courseInstances = Array.isArray(instancesData) 
            ? instancesData.filter((instance: any) => instance.course && instance.course !== "No Course")
            : [];
          setInstances(courseInstances);
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

  // Group instances by course for better organization
  const groupedInstances = instances.reduce((acc, instance) => {
    const courseKey = instance.course;
    if (!acc[courseKey]) {
      acc[courseKey] = [];
    }
    acc[courseKey].push(instance);
    return acc;
  }, {} as Record<string, CourseInstance[]>);

  if (loading) {
    return (
      <SectionCard title="Course Instances">
        <LoadingSpinner size="lg" centered text="Loading course instances..." />
      </SectionCard>
    );
  }

  if (error) {
    return (
      <SectionCard title="Course Instances">
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
      <SectionCard title="Course Instances">
        <EmptyState
          icon={BookOpen}
          title="No course instances found"
          description="No virtual machine instances are currently assigned to courses."
        />
      </SectionCard>
    );
  }

  return (
    <SectionCard 
      title="Course Instances"
      description="Virtual machine instances assigned to courses and their students"
    >
      <div className="space-y-6">
        {Object.entries(groupedInstances).map(([courseName, courseInstances]) => (
          <div key={courseName} className="border border-gray-200 rounded-lg p-4 bg-white">
            <div className="flex items-center space-x-2 mb-4">
              <BookOpen className="h-5 w-5 text-vm-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">{courseName}</h3>
              <span className="bg-vm-blue-100 text-vm-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {courseInstances.length} instance{courseInstances.length !== 1 ? 's' : ''}
              </span>
            </div>
            
            <div className="space-y-3">
              {courseInstances.map((instance) => (
                <div
                  key={instance.id}
                  className="border border-gray-100 rounded-lg p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-md font-medium text-gray-900">
                          {instance.title}
                        </h4>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(instance.status)}`}>
                          <span className="mr-1">{getStatusIcon(instance.status)}</span>
                          {instance.status}
                        </span>
                      </div>
                      
                      {instance.description && (
                        <p className="text-gray-600 mb-2 text-sm">{instance.description}</p>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-2">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Users className="h-4 w-4" />
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
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
