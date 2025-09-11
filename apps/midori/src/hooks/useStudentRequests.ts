import { useState, useCallback } from 'react';
import { momoi_client } from '@midori/libs/momoi';

interface Course {
  id: number;
  title: string;
  code: string;
}

interface Template {
  id: number;
  os_name: string;
  vm_type: string;
}

interface Instance {
  id: number;
  hostname: string;
  title: string;
  status: string;
  course?: string;
}

interface RequestFormData {
  title: string;
  description: string;
  type: "course" | "project";
  hostname: string;
  course_id: number;
  template_id: number;
  cpus: number;
  memory: number;
  disk: number;
}

interface ExtensionFormData {
  instance_id: number;
  title: string;
  description: string;
}

interface ApiError {
  message: string;
  code?: number;
}

export function useStudentRequests() {
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [courses, setCourses] = useState<Course[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [instances, setInstances] = useState<Instance[]>([]);

  // Fetch autocomplete data
  const fetchAutocompleteData = useCallback(async () => {
    setLoadingData(true);
    setError(null);
    
    try {
      const [coursesResult, templatesResult, instancesResult] = await Promise.all([
        momoi_client.api.v1.autocomplete.course.get(),
        momoi_client.api.v1.autocomplete.template.get(),
        momoi_client.api.v1.student.instances.get()
      ]);
      
      // Handle API errors
      if (coursesResult.error) {
        throw new Error(coursesResult.error.message || 'Failed to fetch courses');
      }
      if (templatesResult.error) {
        throw new Error(templatesResult.error.message || 'Failed to fetch templates');
      }
      if (instancesResult.error) {
        throw new Error(instancesResult.error.message || 'Failed to fetch instances');
      }
      
      // Extract data from API responses
      const coursesData = coursesResult.data?.data || coursesResult.data;
      const templatesData = templatesResult.data?.data || templatesResult.data;
      const instancesData = instancesResult.data?.data || instancesResult.data;
      
      setCourses(coursesData as Course[]);
      setTemplates(templatesData as Template[]);
      setInstances(instancesData as Instance[]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load form data';
      setError(errorMessage);
      console.error('Error fetching autocomplete data:', err);
    } finally {
      setLoadingData(false);
    }
  }, []);

  // Create new instance request
  const createRequest = useCallback(async (data: RequestFormData): Promise<boolean> => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await momoi_client.api.v1.student.requests.post(data);
      
      if (result.error) {
        throw new Error(result.error.message || 'Failed to create request');
      }

      setSuccess('Request created successfully!');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create request';
      setError(errorMessage);
      console.error('Error creating request:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create extension request
  const createExtensionRequest = useCallback(async (data: ExtensionFormData): Promise<boolean> => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await momoi_client.api.v1.student.requests.extends.post(data);
      
      if (result.error) {
        throw new Error(result.error.message || 'Failed to create extension request');
      }

      setSuccess('Extension request created successfully!');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create extension request';
      setError(errorMessage);
      console.error('Error creating extension request:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear messages
  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  return {
    // State
    loading,
    loadingData,
    error,
    success,
    courses,
    templates,
    instances,
    
    // Actions
    fetchAutocompleteData,
    createRequest,
    createExtensionRequest,
    clearMessages,
  };
}
