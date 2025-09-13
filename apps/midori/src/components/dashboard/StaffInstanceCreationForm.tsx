"use client";

import { useState, useEffect, useContext } from "react";
import { SectionCard, LoadingSpinner, AlertMessage } from "@midori/components/ui";
import { momoi_client } from "@midori/libs/momoi";
import { UserContext } from "@midori/contexts/user";
import { User, Server, Cpu, MemoryStick, HardDrive, Calendar, BookOpen, Monitor, Shuffle } from "lucide-react";

interface Template {
  id: number;
  os_name: string;
  vm_type: string;
  based_size: number;
  host_name: string;
  host_status: string;
}

interface Course {
  id: number;
  course_id: string;
  course_title: string;
  main_staff: number;
  assistant_staff_1: number | null;
  assistant_staff_2: number | null;
  assistant_staff_3: number | null;
}

interface Semester {
  id: number;
  name: string;
  start_at: Date;
  end_at: Date;
  active: boolean;
}

interface User {
  id: string;
  email: string;
  name: string;
}

interface StaffInstanceCreationFormProps {
  onInstanceCreated?: () => void;
}

export function StaffInstanceCreationForm({ onInstanceCreated }: StaffInstanceCreationFormProps) {
  const { user } = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form data
  const [formData, setFormData] = useState({
    title: "",
    hostname: "",
    description: "",
    type: "course" as "course" | "personal",
    course_id: 0,
    template_id: 0,
    cpus: 2,
    memory: 2048,
    disk: 16,
    semester_id: 0
  });

  // Available options
  const [templates, setTemplates] = useState<Template[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  // Form validation
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchFormData();
  }, []);

  const fetchFormData = async () => {
    setLoadingData(true);
    setError(null);

    try {
      const [templatesResult, coursesResult, semestersResult] = await Promise.all([
        momoi_client.api.v1.staff.instances.templates.get(),
        momoi_client.api.v1.staff.instances.courses.get(),
        momoi_client.api.v1.staff.instances.semesters.get()
      ]);

      if (templatesResult.error) throw new Error(templatesResult.error.value.message || 'Failed to fetch templates');
      if (coursesResult.error) throw new Error(coursesResult.error.value.message || 'Failed to fetch courses');
      if (semestersResult.error) throw new Error(semestersResult.error.value.message || 'Failed to fetch semesters');

      setTemplates(templatesResult.data?.data || []);
      setCourses(coursesResult.data?.data || []);
      setSemesters(semestersResult.data?.data || []);

      // Set default values
      if (templates.length > 0 && formData.template_id === 0) {
        setFormData(prev => ({ ...prev, template_id: templates[0].id }));
      }
      // Don't auto-select a course - let user choose or use "No Course Override"
      if (semesters.length > 0 && formData.semester_id === 0) {
        const activeSemester = semesters.find(s => s.active);
        setFormData(prev => ({ ...prev, semester_id: activeSemester?.id || semesters[0].id }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch form data');
    } finally {
      setLoadingData(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!user?.id) {
      newErrors.general = "User session not found. Please refresh the page.";
    }
    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }
    if (!formData.hostname.trim()) {
      newErrors.hostname = "Hostname is required";
    } else if (!/^[a-zA-Z0-9-]+$/.test(formData.hostname)) {
      newErrors.hostname = "Hostname can only contain letters, numbers, and hyphens";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }
    if (formData.course_id === 0) {
      newErrors.course_id = "Course is required";
    }
    // Note: course_id === -1 is allowed (No Course Override)
    if (formData.template_id === 0) {
      newErrors.template_id = "Template is required";
    }
    if (formData.cpus < 1 || formData.cpus > 16) {
      newErrors.cpus = "CPUs must be between 1 and 16";
    }
    if (formData.memory < 512 || formData.memory > 32768) {
      newErrors.memory = "Memory must be between 512MB and 32GB";
    }
    if (formData.disk < 8 || formData.disk > 500) {
      newErrors.disk = "Disk must be between 8GB and 500GB";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await momoi_client.api.v1.staff.instances.create.post({
        ...formData,
        user_id: user!.id
      });
      
      if (result.error) {
        throw new Error(result.error.value.message || 'Failed to create instance');
      }

      setSuccess("Instance created successfully! VM creation is in progress.");
      setFormData({
        title: "",
        hostname: "",
        description: "",
        type: "course",
        course_id: 0,
        template_id: templates.length > 0 ? templates[0].id : 0,
        cpus: 2,
        memory: 2048,
        disk: 16,
        semester_id: semesters.find(s => s.active)?.id || (semesters.length > 0 ? semesters[0].id : 0)
      });
      
      if (onInstanceCreated) {
        onInstanceCreated();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create instance');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const generateRandomHostname = () => {
    const adjectives = ['swift', 'bright', 'quick', 'smart', 'bold', 'cool', 'fast', 'sharp', 'keen', 'wise'];
    const nouns = ['server', 'node', 'host', 'vm', 'instance', 'machine', 'system', 'core', 'hub', 'gate'];
    const numbers = Math.floor(Math.random() * 999) + 1;
    
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    
    const hostname = `${adjective}-${noun}-${numbers}`;
    setFormData(prev => ({ ...prev, hostname }));
    
    // Clear any existing hostname errors
    if (errors.hostname) {
      setErrors(prev => ({ ...prev, hostname: "" }));
    }
  };

  if (loadingData) {
    return (
      <SectionCard title="Create New Instance">
        <LoadingSpinner size="lg" centered text="Loading form data..." />
      </SectionCard>
    );
  }

  return (
    <SectionCard 
      title="Create New Instance" 
      description="Create a virtual machine instance directly without requiring a request or semester lock"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <AlertMessage 
            type="error" 
            message={error}
          />
        )}
        
        {success && (
          <AlertMessage 
            type="success" 
            message={success}
          />
        )}

        {/* Current User Info */}
        {user && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <User className="h-5 w-5 text-blue-600 mr-2" />
              <div>
                <h3 className="text-sm font-medium text-blue-800">
                  Creating instance for: {user.name}
                </h3>
                <p className="text-sm text-blue-600">
                  Email: {user.email}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Server className="inline h-4 w-4 mr-1" />
              Instance Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-vm-blue-500 ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter instance title"
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
          </div>

          {/* Hostname */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Monitor className="inline h-4 w-4 mr-1" />
              Hostname <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.hostname}
                onChange={(e) => handleInputChange("hostname", e.target.value)}
                className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-vm-blue-500 ${
                  errors.hostname ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter hostname"
              />
              <button
                type="button"
                onClick={generateRandomHostname}
                className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                title="Generate random hostname"
              >
                <Shuffle className="h-4 w-4" />
              </button>
            </div>
            {errors.hostname && <p className="text-red-500 text-sm mt-1">{errors.hostname}</p>}
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Instance Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => handleInputChange("type", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-vm-blue-500"
            >
              <option value="course">Course</option>
              <option value="personal">Personal</option>
            </select>
          </div>

          {/* Course */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <BookOpen className="inline h-4 w-4 mr-1" />
              Course <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.course_id}
              onChange={(e) => handleInputChange("course_id", parseInt(e.target.value))}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-vm-blue-500 ${
                errors.course_id ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value={0}>Select a course</option>
              <option value={-1}>No Course Override (Staff Only)</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.course_title} ({course.course_id})
                </option>
              ))}
            </select>
            {errors.course_id && <p className="text-red-500 text-sm mt-1">{errors.course_id}</p>}
            {formData.course_id === -1 && (
              <p className="text-blue-600 text-sm mt-1">
                <strong>Staff Override:</strong> This instance will not be associated with any course and bypasses normal course restrictions.
              </p>
            )}
          </div>

          {/* Template */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Server className="inline h-4 w-4 mr-1" />
              Template <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.template_id}
              onChange={(e) => handleInputChange("template_id", parseInt(e.target.value))}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-vm-blue-500 ${
                errors.template_id ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value={0}>Select a template</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.os_name} ({template.vm_type})
                </option>
              ))}
            </select>
            {errors.template_id && <p className="text-red-500 text-sm mt-1">{errors.template_id}</p>}
          </div>

          {/* Semester */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="inline h-4 w-4 mr-1" />
              Semester (Optional)
            </label>
            <select
              value={formData.semester_id}
              onChange={(e) => handleInputChange("semester_id", parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-vm-blue-500"
            >
              <option value={0}>No semester (staff override)</option>
              {semesters.map((semester) => (
                <option key={semester.id} value={semester.id}>
                  {semester.name} {semester.active ? "(Active)" : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            rows={3}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-vm-blue-500 ${
              errors.description ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter instance description"
          />
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
        </div>

        {/* Resource Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Cpu className="inline h-4 w-4 mr-1" />
              CPUs
            </label>
            <input
              type="number"
              min="1"
              max="16"
              value={formData.cpus}
              onChange={(e) => handleInputChange("cpus", parseInt(e.target.value))}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-vm-blue-500 ${
                errors.cpus ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.cpus && <p className="text-red-500 text-sm mt-1">{errors.cpus}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MemoryStick className="inline h-4 w-4 mr-1" />
              Memory (MB)
            </label>
            <input
              type="number"
              min="512"
              max="32768"
              step="512"
              value={formData.memory}
              onChange={(e) => handleInputChange("memory", parseInt(e.target.value))}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-vm-blue-500 ${
                errors.memory ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.memory && <p className="text-red-500 text-sm mt-1">{errors.memory}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <HardDrive className="inline h-4 w-4 mr-1" />
              Disk (GB)
            </label>
            <input
              type="number"
              min="8"
              max="500"
              value={formData.disk}
              onChange={(e) => handleInputChange("disk", parseInt(e.target.value))}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-vm-blue-500 ${
                errors.disk ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.disk && <p className="text-red-500 text-sm mt-1">{errors.disk}</p>}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => {
              setFormData({
                title: "",
                hostname: "",
                description: "",
                type: "course",
                course_id: 0,
                template_id: templates.length > 0 ? templates[0].id : 0,
                cpus: 2,
                memory: 2048,
                disk: 16,
                semester_id: semesters.find(s => s.active)?.id || (semesters.length > 0 ? semesters[0].id : 0)
              });
              setErrors({});
              setError(null);
              setSuccess(null);
            }}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-vm-blue-600 text-white rounded-md hover:bg-vm-blue-700 focus:outline-none focus:ring-2 focus:ring-vm-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Creating Instance...
              </>
            ) : (
              "Create Instance"
            )}
          </button>
        </div>
      </form>
    </SectionCard>
  );
}
