"use client";

import { useState, useEffect } from "react";
import { PageHeader, SectionCard } from "@midori/components/ui";
import { momoi_client } from "@midori/libs/momoi";
import { Plus, Calendar, Edit, Trash2, CheckCircle, XCircle } from "lucide-react";
import { formatDate } from "@midori/utils/format";

interface Semester {
  id: number;
  name: string;
  start_at: Date;
  end_at: Date;
  active: boolean;
  created_at: Date;
  updated_at: Date;
}

interface CreateSemesterForm {
  name: string;
  start_at: string;
  end_at: string;
  active: boolean;
}

export default function SemestersPage() {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [activeSemester, setActiveSemester] = useState<Semester | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingSemester, setEditingSemester] = useState<Semester | null>(null);
  const [formData, setFormData] = useState<CreateSemesterForm>({
    name: "",
    start_at: "",
    end_at: "",
    active: false,
  });


  // Fetch semesters data
  const fetchSemesters = async () => {
    setLoading(true);
    setError(null);
    try {
      const [semestersResult, activeResult] = await Promise.all([
        momoi_client.api.v1.staff.semester.get({
          query: {}
        }),
        momoi_client.api.v1.staff.semester.active.get(),
      ]);

      if (semestersResult.error) {
        throw new Error(semestersResult.error.value.message || 'Failed to fetch semesters');
      }
      if (activeResult.error) {
        throw new Error(activeResult.error.value.message || 'Failed to fetch active semester');
      }

      // Handle the API response structure: { message: string, data: Semester[] }
      const semestersData = semestersResult.data?.data || semestersResult.data;
      const activeData = activeResult.data?.data || activeResult.data;

      setSemesters(Array.isArray(semestersData) ? semestersData : []);
      // Only set activeSemester if we have valid data with an id
      setActiveSemester(activeData && typeof activeData === 'object' && 'id' in activeData ? activeData as Semester : null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 
                          typeof err === 'string' ? err : 
                          JSON.stringify(err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Create new semester
  const handleCreateSemester = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const semesterData = {
        ...formData,
        start_at: new Date(formData.start_at),
        end_at: new Date(formData.end_at),
      };

      const result = await momoi_client.api.v1.staff.semester.post(semesterData);
      if (result.error) {
        throw new Error(result.error.value.message || 'Failed to create semester');
      }
      setShowCreateForm(false);
      setFormData({ name: "", start_at: "", end_at: "", active: false });
      fetchSemesters();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create semester");
    }
  };

  // Update semester
  const handleUpdateSemester = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSemester) return;

    try {
      const updateData = {
        name: formData.name,
        start_at: new Date(formData.start_at),
        end_at: new Date(formData.end_at),
        active: formData.active,
      };

      const result = await momoi_client.api.v1.staff.semester({ id: editingSemester.id }).put(updateData);
      if (result.error) {
        throw new Error(result.error.value.message || 'Failed to update semester');
      }
      setEditingSemester(null);
      setFormData({ name: "", start_at: "", end_at: "", active: false });
      fetchSemesters();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update semester");
    }
  };

  // Activate semester
  const handleActivateSemester = async (semesterId: number) => {
    try {
      const result = await momoi_client.api.v1.staff.semester({ id: semesterId }).activate.post();
      if (result.error) {
        throw new Error(result.error.value.message || 'Failed to activate semester');
      }
      fetchSemesters();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to activate semester");
    }
  };

  // Delete semester
  const handleDeleteSemester = async (semesterId: number) => {
    if (!confirm("Are you sure you want to delete this semester?")) return;

    try {
      const result = await momoi_client.api.v1.staff.semester({ id: semesterId }).delete();
      if (result.error) {
        throw new Error(result.error.value.message || 'Failed to delete semester');
      }
      fetchSemesters();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete semester");
    }
  };

  // Start editing
  const startEditing = (semester: Semester) => {
    setEditingSemester(semester);

    // Handle both string and Date object formats
    const formatDateForInput = (date: string | Date) => {
      if (typeof date === 'string') {
        return date.split('T')[0]; // Convert ISO string to YYYY-MM-DD format
      } else if (date instanceof Date) {
        return date.toISOString().split('T')[0]; // Convert Date object to YYYY-MM-DD format
      }
      return '';
    };

    setFormData({
      name: semester.name,
      start_at: formatDateForInput(semester.start_at),
      end_at: formatDateForInput(semester.end_at),
      active: semester.active,
    });
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingSemester(null);
    setFormData({ name: "", start_at: "", end_at: "", active: false });
  };

  useEffect(() => {
    fetchSemesters();
  }, []);


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-vm-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Semester Management"
        description="Manage academic semesters and set active semester"
      />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Active Semester - Only show if we have a valid active semester */}
      {activeSemester && activeSemester.id && (
        <SectionCard title="Active Semester">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-green-800">{activeSemester.name}</h3>
                <p className="text-green-600">
                  {formatDate(activeSemester.start_at)} - {formatDate(activeSemester.end_at)}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
              </div>
            </div>
          </div>
        </SectionCard>
      )}

      {/* Create/Edit Form */}
      {(showCreateForm || editingSemester) && (
        <SectionCard
          title={editingSemester ? "Edit Semester" : "Create New Semester"}
        >
          <form onSubmit={editingSemester ? handleUpdateSemester : handleCreateSemester} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Semester Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-vm-blue-500"
                  required
                />
              </div>
              <div className="flex items-center mt-6">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="rounded border-gray-300 text-vm-blue-600 focus:ring-vm-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Set as active semester</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="start_at" className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  id="start_at"
                  value={formData.start_at}
                  onChange={(e) => setFormData({ ...formData, start_at: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-vm-blue-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="end_at" className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  id="end_at"
                  value={formData.end_at}
                  onChange={(e) => setFormData({ ...formData, end_at: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-vm-blue-500"
                  required
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="px-4 py-2 bg-vm-blue-600 text-white rounded-md hover:bg-vm-blue-700 focus:outline-none focus:ring-2 focus:ring-vm-blue-500"
              >
                {editingSemester ? "Update Semester" : "Create Semester"}
              </button>
              <button
                type="button"
                onClick={editingSemester ? cancelEditing : () => setShowCreateForm(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
            </div>
          </form>
        </SectionCard>
      )}

      {/* Semesters List */}
      <SectionCard title="All Semesters">
        <div className="flex justify-between items-center mb-4">
          <p className="text-gray-600">Manage all academic semesters</p>
          {!showCreateForm && !editingSemester && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-4 py-2 bg-vm-blue-600 text-white rounded-md hover:bg-vm-blue-700 focus:outline-none focus:ring-2 focus:ring-vm-blue-500 flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Semester</span>
            </button>
          )}
        </div>

        {semesters.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No semesters found. Create your first semester to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {semesters.map((semester) => (
              <div
                key={semester.id}
                className={`border rounded-lg p-4 ${semester.active ? "border-green-200 bg-green-50" : "border-gray-200 bg-white"
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-semibold text-gray-900">{semester.name}</h3>
                      {semester.active && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 mt-1">
                      {formatDate(semester.start_at)} - {formatDate(semester.end_at)}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Created: {formatDate(semester.created_at)}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    {!semester.active && (
                      <button
                        onClick={() => handleActivateSemester(semester.id)}
                        className="p-2 text-green-600 hover:bg-green-100 rounded-md"
                        title="Activate semester"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => startEditing(semester)}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-md"
                      title="Edit semester"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteSemester(semester.id)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-md"
                      title="Delete semester"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
