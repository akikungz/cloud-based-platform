"use client";

import { useState, useEffect } from "react";
import { PageHeader, SectionCard, SearchInput, LoadingSpinner, AlertMessage } from "@midori/components/ui";
import { momoi_client } from "@midori/libs/momoi";
import { Book, Users, Plus, Edit, Trash2, User, UserCheck, AlertCircle, CheckCircle, X } from "lucide-react";
import { formatDate } from "@midori/utils/format";

interface Course {
  id: number;
  course_id: string;
  course_title: string;
  main_staff: number;
  assistant_staff_1?: number;
  assistant_staff_2?: number;
  assistant_staff_3?: number;
  created_at: string;
  updated_at: string;
  _count?: {
    instance_request: number;
    instance: number;
  };
}


interface CreateCourseData {
  course_id: string;
  course_title: string;
  main_staff: number;
  assistant_staff_1?: number;
  assistant_staff_2?: number;
}

interface StaffMember {
  id: number;
  email: string;
  name: string;
  staff_id: number;
  created_at: string;
  updated_at: string;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [showInlineEditForm, setShowInlineEditForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [staffLoading, setStaffLoading] = useState(false);

  // Fetch courses from the proper API endpoint
  const fetchCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await momoi_client.api.v1.staff.course.get();
      if (result.error) {
        throw new Error(result.error.message || 'Failed to fetch courses');
      }
      setCourses(result.data?.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch courses");
    } finally {
      setLoading(false);
    }
  };

  // Search courses using API
  const searchCourses = async (query: string) => {
    if (!query.trim()) {
      fetchCourses();
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await momoi_client.api.v1.staff.course.search.get({
        query: { q: query }
      });
      if (result.error) {
        throw new Error(result.error.message || 'Failed to search courses');
      }
      setCourses(result.data?.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to search courses");
    } finally {
      setLoading(false);
    }
  };

  // Fetch staff members
  const fetchStaffMembers = async () => {
    setStaffLoading(true);
    try {
      const result = await momoi_client.api.v1.staff.persons.get();
      if (result.error) {
        throw new Error(result.error.message || 'Failed to fetch staff members');
      }
      setStaffMembers(result.data?.data || []);
    } catch (err) {
      console.error('Failed to fetch staff members:', err);
      setStaffMembers([]);
    } finally {
      setStaffLoading(false);
    }
  };


  // Create new course
  const createCourse = async (courseData: CreateCourseData) => {
    try {
      const result = await momoi_client.api.v1.staff.course.post(courseData);
      if (result.error) {
        throw new Error(result.error.message || 'Failed to create course');
      }
      setSuccessMessage('Course created successfully');
      fetchCourses();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create course");
    }
  };

  // Update course
  const updateCourse = async (courseId: number, courseData: Partial<CreateCourseData>) => {
    try {
      const result = await momoi_client.api.v1.staff.course({ id: courseId }).put(courseData);
      if (result.error) {
        throw new Error(result.error.message || 'Failed to update course');
      }
      setSuccessMessage('Course updated successfully');
      setShowEditForm(false);
      setShowInlineEditForm(false);
      setEditingCourse(null);
      fetchCourses();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update course");
    }
  };

  // Delete course
  const deleteCourse = async (courseId: number) => {
    if (!confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }

    try {
      const result = await momoi_client.api.v1.staff.course({ id: courseId }).delete();
      if (result.error) {
        throw new Error(result.error.message || 'Failed to delete course');
      }
      setSuccessMessage('Course deleted successfully');
      fetchCourses();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete course");
    }
  };

  // Handle search when search button is clicked or Enter is pressed
  const handleSearch = () => {
    if (searchQuery.trim()) {
      searchCourses(searchQuery);
    } else {
      fetchCourses();
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchStaffMembers();
  }, []);

  // Clear success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Helper function to get staff member name by ID
  const getStaffName = (staffId: number) => {
    const staff = staffMembers.find(member => member.staff_id === staffId);
    return staff ? staff.name : `Staff ID: ${staffId}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="xl" text="Loading courses..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Course Management"
        description="View and manage course information and staff assignments"
      />

      {error && (
        <AlertMessage
          type="error"
          message={error}
          dismissible
          onDismiss={() => setError(null)}
        />
      )}

      {successMessage && (
        <AlertMessage
          type="success"
          message={successMessage}
          dismissible
          onDismiss={() => setSuccessMessage(null)}
        />
      )}

      {/* Search Section */}
      {/* <SectionCard title="Search Courses">
        <div className="space-y-4">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={handleSearch}
            showSearchButton={true}
            placeholder="Search courses by title or code..."
          />

          {searchQuery && (
            <p className="text-sm text-gray-600">
              Found {courses.length} course{courses.length !== 1 ? 's' : ''} matching "{searchQuery}"
            </p>
          )}
        </div>
      </SectionCard> */}

      {/* Create/Edit Course Form */}
      <SectionCard title={showInlineEditForm && editingCourse ? "Edit Course" : "Add New Course"}>
        {showInlineEditForm && editingCourse ? (
          <EditCourseFormInline
            course={editingCourse}
            staffMembers={staffMembers}
            staffLoading={staffLoading}
            onSubmit={(data) => updateCourse(editingCourse.id, data)}
            onCancel={() => {
              setShowInlineEditForm(false);
              setEditingCourse(null);
            }}
          />
        ) : (
          <CreateCourseFormInline
            staffMembers={staffMembers}
            staffLoading={staffLoading}
            onSubmit={createCourse}
          />
        )}
      </SectionCard>

      {/* Courses List */}
      <SectionCard title="Course Lists">
        <div className="space-y-3">
          {courses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Book className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>
                {searchQuery ?
                  `No courses found matching "${searchQuery}"` :
                  "No courses available"
                }
              </p>
            </div>
          ) : (
            courses.map((course) => (
              <div
                key={course.id}
                className="border rounded-lg p-4 bg-white hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{course.course_title}</h3>
                    <p className="text-gray-600">Course Code: {course.course_id}</p>

                    {/* Staff Members */}
                    <div className="mt-2">
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <User className="h-4 w-4 text-blue-500" />
                          <span className="font-medium">Main:</span>
                          <span>{getStaffName(course.main_staff)}</span>
                        </div>
                        {course.assistant_staff_1 && (
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4 text-green-500" />
                            <span className="font-medium">Asst 1:</span>
                            <span>{getStaffName(course.assistant_staff_1)}</span>
                          </div>
                        )}
                        {course.assistant_staff_2 && (
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4 text-green-500" />
                            <span className="font-medium">Asst 2:</span>
                            <span>{getStaffName(course.assistant_staff_2)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {course._count && (
                      <div className="flex space-x-4 mt-2 text-sm text-gray-500">
                        <span>{course._count.instance_request} requests</span>
                        <span>{course._count.instance} instances</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      ID: {course.id}
                    </span>
                    <button
                      onClick={() => {
                        setEditingCourse(course);
                        setShowInlineEditForm(true);
                      }}
                      className="p-2 text-gray-400 hover:text-vm-blue-600 transition-colors"
                      title="Edit Course"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteCourse(course.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete Course"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </SectionCard>

      {/* Statistics */}
      <SectionCard title="Course Statistics">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <Book className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-600">Total Courses</p>
                <p className="text-2xl font-bold text-blue-900">{courses.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-green-600">Total Requests</p>
                <p className="text-2xl font-bold text-green-900">
                  {courses.reduce((sum, course) => sum + (course._count?.instance_request || 0), 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center">
              <UserCheck className="h-8 w-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-purple-600">Total Instances</p>
                <p className="text-2xl font-bold text-purple-900">
                  {courses.reduce((sum, course) => sum + (course._count?.instance || 0), 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </SectionCard>


      {/* Edit Course Modal */}
      {showEditForm && editingCourse && (
        <EditCourseForm
          course={editingCourse}
          staffMembers={staffMembers}
          staffLoading={staffLoading}
          onClose={() => {
            setShowEditForm(false);
            setEditingCourse(null);
          }}
          onSubmit={(data) => updateCourse(editingCourse.id, data)}
        />
      )}
    </div>
  );
}

// Create Course Form Component (Inline)
function CreateCourseFormInline({
  staffMembers,
  staffLoading,
  onSubmit
}: {
  staffMembers: StaffMember[];
  staffLoading: boolean;
  onSubmit: (data: CreateCourseData) => void;
}) {
  const [formData, setFormData] = useState<CreateCourseData>({
    course_id: '',
    course_title: '',
    main_staff: 0,
    assistant_staff_1: undefined,
    assistant_staff_2: undefined,
  });
  const [loading, setLoading] = useState(false);

  // Helper function to get available staff for a specific field
  const getAvailableStaff = (excludeStaffIds: number[]) => {
    return staffMembers.filter(staff => !excludeStaffIds.includes(staff.staff_id));
  };

  // Get available staff for each field
  const getMainStaffOptions = () => {
    const excludedIds = [
      formData.assistant_staff_1,
      formData.assistant_staff_2
    ].filter(Boolean) as number[];
    return getAvailableStaff(excludedIds);
  };

  const getAssistant1Options = () => {
    const excludedIds = [
      formData.main_staff,
      formData.assistant_staff_2
    ].filter(Boolean) as number[];
    return getAvailableStaff(excludedIds);
  };

  const getAssistant2Options = () => {
    const excludedIds = [
      formData.main_staff,
      formData.assistant_staff_1
    ].filter(Boolean) as number[];
    return getAvailableStaff(excludedIds);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.course_id || !formData.course_title || !formData.main_staff) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      // Reset form after successful submission
      setFormData({
        course_id: '',
        course_title: '',
        main_staff: 0,
        assistant_staff_1: undefined,
        assistant_staff_2: undefined,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Course ID *
          </label>
          <input
            type="text"
            value={formData.course_id}
            onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-vm-blue-500"
            placeholder="e.g., CS101"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Course Title *
          </label>
          <input
            type="text"
            value={formData.course_title}
            onChange={(e) => setFormData({ ...formData, course_title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-vm-blue-500"
            placeholder="e.g., Introduction to Computer Science"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Main Staff *
          </label>
          {staffLoading ? (
            <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
              Loading staff members...
            </div>
          ) : (
            <select
              value={formData.main_staff || ''}
              onChange={(e) => setFormData({ ...formData, main_staff: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-vm-blue-500"
              required
            >
              <option value="">Select main staff</option>
              {getMainStaffOptions().map((staff) => (
                <option key={staff.staff_id} value={staff.staff_id}>
                  {staff.name || staff.email}
                </option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Assistant Staff 1
          </label>
          {staffLoading ? (
            <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
              Loading staff members...
            </div>
          ) : (
            <select
              value={formData.assistant_staff_1 || ''}
              onChange={(e) => setFormData({ ...formData, assistant_staff_1: parseInt(e.target.value) || undefined })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-vm-blue-500"
            >
              <option value="">Select assistant</option>
              {getAssistant1Options().map((staff) => (
                <option key={staff.staff_id} value={staff.staff_id}>
                  {staff.name || staff.email}
                </option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Assistant Staff 2
          </label>
          {staffLoading ? (
            <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
              Loading staff members...
            </div>
          ) : (
            <select
              value={formData.assistant_staff_2 || ''}
              onChange={(e) => setFormData({ ...formData, assistant_staff_2: parseInt(e.target.value) || undefined })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-vm-blue-500"
            >
              <option value="">Select assistant</option>
              {getAssistant2Options().map((staff) => (
                <option key={staff.staff_id} value={staff.staff_id}>
                  {staff.name || staff.email}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-vm-blue-600 text-white rounded-md hover:bg-vm-blue-700 focus:outline-none focus:ring-2 focus:ring-vm-blue-500 disabled:opacity-50 flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>{loading ? 'Creating...' : 'Create Course'}</span>
        </button>
      </div>
    </form>
  );
}

// Edit Course Form Component (Inline)
function EditCourseFormInline({
  course,
  staffMembers,
  staffLoading,
  onSubmit,
  onCancel
}: {
  course: Course;
  staffMembers: StaffMember[];
  staffLoading: boolean;
  onSubmit: (data: Partial<CreateCourseData>) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<CreateCourseData>({
    course_id: course.course_id,
    course_title: course.course_title,
    main_staff: course.main_staff,
    assistant_staff_1: course.assistant_staff_1,
    assistant_staff_2: course.assistant_staff_2,
  });
  const [loading, setLoading] = useState(false);

  // Helper function to get available staff for a specific field
  const getAvailableStaff = (excludeStaffIds: number[]) => {
    return staffMembers.filter(staff => !excludeStaffIds.includes(staff.staff_id));
  };

  // Get available staff for each field
  const getMainStaffOptions = () => {
    const excludedIds = [
      formData.assistant_staff_1,
      formData.assistant_staff_2,
    ].filter(Boolean) as number[];
    return getAvailableStaff(excludedIds);
  };

  const getAssistant1Options = () => {
    const excludedIds = [
      formData.main_staff,
      formData.assistant_staff_2,
    ].filter(Boolean) as number[];
    return getAvailableStaff(excludedIds);
  };

  const getAssistant2Options = () => {
    const excludedIds = [
      formData.main_staff,
      formData.assistant_staff_1,
    ].filter(Boolean) as number[];
    return getAvailableStaff(excludedIds);
  };

  const getAssistant3Options = () => {
    const excludedIds = [
      formData.main_staff,
      formData.assistant_staff_1,
      formData.assistant_staff_2
    ].filter(Boolean) as number[];
    return getAvailableStaff(excludedIds);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.course_id || !formData.course_title || !formData.main_staff) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Course ID *
          </label>
          <input
            type="text"
            value={formData.course_id}
            onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-vm-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Course Title *
          </label>
          <input
            type="text"
            value={formData.course_title}
            onChange={(e) => setFormData({ ...formData, course_title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-vm-blue-500"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Main Staff *
          </label>
          {staffLoading ? (
            <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
              Loading staff members...
            </div>
          ) : (
            <select
              value={formData.main_staff || ''}
              onChange={(e) => setFormData({ ...formData, main_staff: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-vm-blue-500"
              required
            >
              <option value="">Select main staff</option>
              {getMainStaffOptions().map((staff) => (
                <option key={staff.staff_id} value={staff.staff_id}>
                  {staff.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Assistant Staff 1
          </label>
          {staffLoading ? (
            <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
              Loading staff members...
            </div>
          ) : (
            <select
              value={formData.assistant_staff_1 || ''}
              onChange={(e) => setFormData({ ...formData, assistant_staff_1: parseInt(e.target.value) || undefined })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-vm-blue-500"
            >
              <option value="">Select assistant</option>
              {getAssistant1Options().map((staff) => (
                <option key={staff.staff_id} value={staff.staff_id}>
                  {staff.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Assistant Staff 2
          </label>
          {staffLoading ? (
            <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
              Loading staff members...
            </div>
          ) : (
            <select
              value={formData.assistant_staff_2 || ''}
              onChange={(e) => setFormData({ ...formData, assistant_staff_2: parseInt(e.target.value) || undefined })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-vm-blue-500"
            >
              <option value="">Select assistant</option>
              {getAssistant2Options().map((staff) => (
                <option key={staff.staff_id} value={staff.staff_id}>
                  {staff.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-vm-blue-600 text-white rounded-md hover:bg-vm-blue-700 focus:outline-none focus:ring-2 focus:ring-vm-blue-500 disabled:opacity-50 flex items-center space-x-2"
        >
          <Edit className="h-4 w-4" />
          <span>{loading ? 'Updating...' : 'Update Course'}</span>
        </button>
      </div>
    </form>
  );
}

// Edit Course Form Component
function EditCourseForm({
  course,
  staffMembers,
  staffLoading,
  onClose,
  onSubmit
}: {
  course: Course;
  staffMembers: StaffMember[];
  staffLoading: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<CreateCourseData>) => void;
}) {
  const [formData, setFormData] = useState<CreateCourseData>({
    course_id: course.course_id,
    course_title: course.course_title,
    main_staff: course.main_staff,
    assistant_staff_1: course.assistant_staff_1,
    assistant_staff_2: course.assistant_staff_2,
  });
  const [loading, setLoading] = useState(false);

  // Helper function to get available staff for a specific field
  const getAvailableStaff = (excludeStaffIds: number[]) => {
    return staffMembers.filter(staff => !excludeStaffIds.includes(staff.staff_id));
  };

  // Get available staff for each field
  const getMainStaffOptions = () => {
    const excludedIds = [
      formData.assistant_staff_1,
      formData.assistant_staff_2,
    ].filter(Boolean) as number[];
    return getAvailableStaff(excludedIds);
  };

  const getAssistant1Options = () => {
    const excludedIds = [
      formData.main_staff,
      formData.assistant_staff_2,
    ].filter(Boolean) as number[];
    return getAvailableStaff(excludedIds);
  };

  const getAssistant2Options = () => {
    const excludedIds = [
      formData.main_staff,
      formData.assistant_staff_1,
    ].filter(Boolean) as number[];
    return getAvailableStaff(excludedIds);
  };

  const getAssistant3Options = () => {
    const excludedIds = [
      formData.main_staff,
      formData.assistant_staff_1,
      formData.assistant_staff_2
    ].filter(Boolean) as number[];
    return getAvailableStaff(excludedIds);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.course_id || !formData.course_title || !formData.main_staff) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Edit Course</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Course ID *
            </label>
            <input
              type="text"
              value={formData.course_id}
              onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-vm-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Course Title *
            </label>
            <input
              type="text"
              value={formData.course_title}
              onChange={(e) => setFormData({ ...formData, course_title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-vm-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Main Staff *
            </label>
            {staffLoading ? (
              <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                Loading staff members...
              </div>
            ) : (
              <select
                value={formData.main_staff || ''}
                onChange={(e) => setFormData({ ...formData, main_staff: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-vm-blue-500"
                required
              >
                <option value="">Select main staff member</option>
                {getMainStaffOptions().map((staff) => (
                  <option key={staff.staff_id} value={staff.staff_id}>
                    {staff.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assistant Staff 1
            </label>
            {staffLoading ? (
              <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                Loading staff members...
              </div>
            ) : (
              <select
                value={formData.assistant_staff_1 || ''}
                onChange={(e) => setFormData({ ...formData, assistant_staff_1: parseInt(e.target.value) || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-vm-blue-500"
              >
                <option value="">Select assistant staff member</option>
                {getAssistant1Options().map((staff) => (
                  <option key={staff.staff_id} value={staff.staff_id}>
                    {staff.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assistant Staff 2
            </label>
            {staffLoading ? (
              <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                Loading staff members...
              </div>
            ) : (
              <select
                value={formData.assistant_staff_2 || ''}
                onChange={(e) => setFormData({ ...formData, assistant_staff_2: parseInt(e.target.value) || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-vm-blue-500"
              >
                <option value="">Select assistant staff member</option>
                {getAssistant2Options().map((staff) => (
                  <option key={staff.staff_id} value={staff.staff_id}>
                    {staff.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-vm-blue-600 text-white rounded-md hover:bg-vm-blue-700 disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}