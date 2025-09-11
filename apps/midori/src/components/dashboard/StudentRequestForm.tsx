"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@midori/components/ui/card';
import { Loader2, RefreshCw, Server, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useStudentRequests } from '@midori/hooks/useStudentRequests';

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

interface FormErrors {
  title?: string;
  description?: string;
  hostname?: string;
  course_id?: string;
  template_id?: string;
  cpus?: string;
  memory?: string;
  disk?: string;
  instance_id?: string;
  type?: string;
}

interface StudentRequestFormProps {
  onRequestSubmitted?: () => void;
}

export function StudentRequestForm({ onRequestSubmitted }: StudentRequestFormProps) {
  const [activeTab, setActiveTab] = useState<'create' | 'extend'>('create');
  const [errors, setErrors] = useState<FormErrors>({});

  const {
    loading,
    loadingData,
    error,
    success,
    courses,
    templates,
    instances,
    fetchAutocompleteData,
    createRequest,
    createExtensionRequest,
    clearMessages,
  } = useStudentRequests();

  // Form data for regular requests
  const [requestData, setRequestData] = useState<RequestFormData>({
    title: '',
    description: '',
    type: 'course',
    hostname: '',
    course_id: 0,
    template_id: 0,
    cpus: 2,
    memory: 2048,
    disk: 16,
  });

  // Form data for extension requests
  const [extensionData, setExtensionData] = useState<ExtensionFormData>({
    instance_id: 0,
    title: '',
    description: '',
  });

  // Validation functions
  const validateRequestForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!requestData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (requestData.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }

    if (!requestData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (requestData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    if (!requestData.hostname.trim()) {
      newErrors.hostname = 'Hostname is required';
    } else if (!/^[a-zA-Z0-9-]+$/.test(requestData.hostname)) {
      newErrors.hostname = 'Hostname can only contain letters, numbers, and hyphens';
    }

    if (requestData.course_id === 0) {
      newErrors.course_id = 'Please select a course';
    }

    if (requestData.template_id === 0) {
      newErrors.template_id = 'Please select a template';
    }

    if (requestData.cpus < 1 || requestData.cpus > 8) {
      newErrors.cpus = 'CPU cores must be between 1 and 8';
    }

    if (requestData.memory < 256 || requestData.memory > 8192) {
      newErrors.memory = 'Memory must be between 256 MB and 8192 MB';
    }

    if (requestData.disk < 8 || requestData.disk > 32) {
      newErrors.disk = 'Disk space must be between 8 GB and 32 GB';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateExtensionForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (extensionData.instance_id === 0) {
      newErrors.instance_id = 'Please select an instance';
    }

    if (!extensionData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (extensionData.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }

    if (!extensionData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (extensionData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Fetch autocomplete data on component mount
  useEffect(() => {
    fetchAutocompleteData();
  }, [fetchAutocompleteData]);

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateRequestForm()) {
      return;
    }

    const success = await createRequest(requestData);

    if (success) {
      // Reset form
      setRequestData({
        title: '',
        description: '',
        type: 'course',
        hostname: '',
        course_id: 0,
        template_id: 0,
        cpus: 2,
        memory: 2048,
        disk: 16,
      });
      setErrors({});
      onRequestSubmitted?.();
    }
  };

  const handleExtensionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateExtensionForm()) {
      return;
    }

    const success = await createExtensionRequest(extensionData);

    if (success) {
      // Reset form
      setExtensionData({
        instance_id: 0,
        title: '',
        description: '',
      });
      setErrors({});
      onRequestSubmitted?.();
    }
  };

  const generateHostname = () => {
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const newHostname = `student-vm-${randomSuffix}`;
    setRequestData(prev => ({ ...prev, hostname: newHostname }));
  };

  const refreshData = async () => {
    await fetchAutocompleteData();
  };

  if (loadingData) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading form data...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <CardTitle>Create New Request</CardTitle>
            <CardDescription>Submit a request for a new instance or extend an existing one</CardDescription>
          </div>
          <button
            onClick={refreshData}
            disabled={loadingData}
            className="flex items-center space-x-2 px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loadingData ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">

        {/* Status Messages */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-center space-x-2">
            <XCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded flex items-center space-x-2">
            <CheckCircle className="h-4 w-4" />
            <span>{success}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('create')}
            className={`px-4 py-2 font-medium flex items-center space-x-2 ${activeTab === 'create'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            <Server className="h-4 w-4" />
            <span>New Instance Request</span>
          </button>
          <button
            onClick={() => setActiveTab('extend')}
            className={`px-4 py-2 font-medium flex items-center space-x-2 ${activeTab === 'extend'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            <Clock className="h-4 w-4" />
            <span>Extend Instance</span>
          </button>
        </div>

        {/* New Instance Request Form */}
        {activeTab === 'create' && (
          <div>
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">New Instance Request</h3>
              <p className="text-sm text-gray-600">
                Request a new virtual machine instance for your course or project
              </p>
            </div>
            <div>
              <form onSubmit={handleRequestSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                      Title *
                    </label>
                    <input
                      id="title"
                      type="text"
                      value={requestData.title}
                      onChange={(e) => setRequestData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter request title"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.title ? 'border-red-500' : 'border-gray-300'
                        }`}
                    />
                    {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                      Request Type *
                    </label>
                    <select
                      id="type"
                      value={requestData.type}
                      onChange={(e) => setRequestData(prev => ({ ...prev, type: e.target.value as "course" | "project" }))}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.type ? 'border-red-500' : 'border-gray-300'
                        }`}
                    >
                      <option value="course">Course Work</option>
                      <option value="project">Project Work</option>
                    </select>
                    {errors.type && <p className="text-sm text-red-500">{errors.type}</p>}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="hostname" className="block text-sm font-medium text-gray-700">
                      Hostname *
                    </label>
                    <div className="flex gap-2">
                      <input
                        id="hostname"
                        type="text"
                        value={requestData.hostname}
                        onChange={(e) => setRequestData(prev => ({ ...prev, hostname: e.target.value }))}
                        placeholder="Enter hostname"
                        className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.hostname ? 'border-red-500' : 'border-gray-300'
                          }`}
                      />
                      <button
                        type="button"
                        onClick={generateHostname}
                        className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        Generate
                      </button>
                    </div>
                    {errors.hostname && <p className="text-sm text-red-500">{errors.hostname}</p>}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="course" className="block text-sm font-medium text-gray-700">
                      Course *
                    </label>
                    <select
                      id="course"
                      value={requestData.course_id}
                      onChange={(e) => setRequestData(prev => ({ ...prev, course_id: parseInt(e.target.value) }))}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.course_id ? 'border-red-500' : 'border-gray-300'
                        }`}
                    >
                      <option value={0}>Select a course</option>
                      {courses.map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.title} ({course.code})
                        </option>
                      ))}
                    </select>
                    {errors.course_id && <p className="text-sm text-red-500">{errors.course_id}</p>}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="template" className="block text-sm font-medium text-gray-700">
                      Template *
                    </label>
                    <select
                      id="template"
                      value={requestData.template_id}
                      onChange={(e) => setRequestData(prev => ({ ...prev, template_id: parseInt(e.target.value) }))}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.template_id ? 'border-red-500' : 'border-gray-300'
                        }`}
                    >
                      <option value={0}>Select a template</option>
                      {templates.map((template) => (
                        <option key={template.id} value={template.id}>
                          {template.os_name} ({template.vm_type})
                        </option>
                      ))}
                    </select>
                    {errors.template_id && <p className="text-sm text-red-500">{errors.template_id}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description *
                  </label>
                  <textarea
                    id="description"
                    value={requestData.description}
                    onChange={(e) => setRequestData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your request requirements..."
                    rows={4}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.description ? 'border-red-500' : 'border-gray-300'
                      }`}
                  />
                  {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
                </div>

                {/* Resource Specifications */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Resource Specifications</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="cpus" className="block text-sm font-medium text-gray-700">
                        CPU Cores
                      </label>
                      <input
                        id="cpus"
                        type="number"
                        min="1"
                        max="8"
                        value={requestData.cpus}
                        onChange={(e) => setRequestData(prev => ({ ...prev, cpus: parseInt(e.target.value) }))}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.cpus ? 'border-red-500' : 'border-gray-300'
                          }`}
                      />
                      {errors.cpus && <p className="text-sm text-red-500">{errors.cpus}</p>}
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="memory" className="block text-sm font-medium text-gray-700">
                        Memory (MB)
                      </label>
                      <input
                        id="memory"
                        type="number"
                        min="256"
                        max="8192"
                        step="256"
                        value={requestData.memory}
                        onChange={(e) => setRequestData(prev => ({ ...prev, memory: parseInt(e.target.value) }))}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.memory ? 'border-red-500' : 'border-gray-300'
                          }`}
                      />
                      {errors.memory && <p className="text-sm text-red-500">{errors.memory}</p>}
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="disk" className="block text-sm font-medium text-gray-700">
                        Disk (GB)
                      </label>
                      <input
                        id="disk"
                        type="number"
                        min="8"
                        max="32"
                        value={requestData.disk}
                        onChange={(e) => setRequestData(prev => ({ ...prev, disk: parseInt(e.target.value) }))}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.disk ? 'border-red-500' : 'border-gray-300'
                          }`}
                      />
                      {errors.disk && <p className="text-sm text-red-500">{errors.disk}</p>}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 min-w-[140px] justify-center"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Creating...</span>
                      </>
                    ) : (
                      'Create Request'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Extension Request Form */}
        {activeTab === 'extend' && (
          <div>
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Extend Instance Request</h3>
              <p className="text-sm text-gray-600">
                Request an extension for an existing instance
              </p>
            </div>
            <div>
              <form onSubmit={handleExtensionSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="instance" className="block text-sm font-medium text-gray-700">
                      Instance *
                    </label>
                    <select
                      id="instance"
                      value={extensionData.instance_id}
                      onChange={(e) => setExtensionData(prev => ({ ...prev, instance_id: parseInt(e.target.value) }))}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.instance_id ? 'border-red-500' : 'border-gray-300'
                        }`}
                    >
                      <option value={0}>Select an instance</option>
                      {instances.map((instance) => (
                        <option key={instance.id} value={instance.id}>
                          {instance.hostname} - {instance.title}
                        </option>
                      ))}
                    </select>
                    {errors.instance_id && <p className="text-sm text-red-500">{errors.instance_id}</p>}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="extend-title" className="block text-sm font-medium text-gray-700">
                      Title *
                    </label>
                    <input
                      id="extend-title"
                      type="text"
                      value={extensionData.title}
                      onChange={(e) => setExtensionData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter extension request title"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.title ? 'border-red-500' : 'border-gray-300'
                        }`}
                    />
                    {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="extend-description" className="block text-sm font-medium text-gray-700">
                    Description *
                  </label>
                  <textarea
                    id="extend-description"
                    value={extensionData.description}
                    onChange={(e) => setExtensionData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Explain why you need an extension..."
                    rows={4}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.description ? 'border-red-500' : 'border-gray-300'
                      }`}
                  />
                  {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 min-w-[180px] justify-center"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Creating...</span>
                      </>
                    ) : (
                      'Create Extension Request'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
