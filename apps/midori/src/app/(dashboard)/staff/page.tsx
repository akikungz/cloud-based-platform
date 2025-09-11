"use client";

import { useState, useEffect } from "react";
import { PageHeader, SectionCard } from "@midori/components/ui";
import { momoi_client } from "@midori/libs/momoi";
import { Plus, Users, User, Search, Trash2, UserPlus, Mail } from "lucide-react";
import { formatDate } from "@midori/utils/format";

interface Person {
  id: number;
  email: string;
  name?: string;
  role?: string;
  created_at: string;
  updated_at: string;
}

interface CreatePersonForm {
  email: string;
}

export default function StaffPage() {
  const [persons, setPersons] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState<CreatePersonForm>({
    email: "",
  });

  // Fetch all persons
  const fetchPersons = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await momoi_client.api.v1.staff.persons.get();
      if (result.error) {
        throw new Error(result.error.message || 'Failed to fetch staff members');
      }
      // Handle the API response structure: { message: string, data: Person[] }
      const personsData = result.data?.data || result.data;
      setPersons(Array.isArray(personsData) ? personsData : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch staff members");
    } finally {
      setLoading(false);
    }
  };

  // Filter persons based on search query
  const filteredPersons = persons.filter(person => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      person.email.toLowerCase().includes(query) ||
      (person.name && person.name.toLowerCase().includes(query))
    );
  });

  // Create new person
  const handleCreatePerson = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await momoi_client.api.v1.staff.persons.post({ email: formData.email });
      if (result.error) {
        throw new Error(result.error.message || 'Failed to create person');
      }
      setShowCreateForm(false);
      setFormData({ email: "" });
      fetchPersons();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create person");
    }
  };

  // Delete person
  const handleDeletePerson = async (email: string) => {
    if (!confirm(`Are you sure you want to delete ${email}?`)) return;

    try {
      const result = await momoi_client.api.v1.staff.persons.delete({ email });
      if (result.error) {
        throw new Error(result.error.message || 'Failed to delete person');
      }
      fetchPersons();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete person");
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery("");
  };

  useEffect(() => {
    fetchPersons();
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
        title="Staff Management"
        description="Manage staff members and their access to the platform"
      />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Search Section */}
      <SectionCard title="Search Staff Members">
        <div className="space-y-4">
          <div className="flex space-x-3">
            <div className="flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or email address..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-vm-blue-500"
              />
            </div>
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 flex items-center space-x-2"
              >
                <Search className="h-4 w-4" />
                <span>Clear</span>
              </button>
            )}
          </div>
          {searchQuery && (
            <p className="text-sm text-gray-600">
              Showing {filteredPersons.length} of {persons.length} staff members
            </p>
          )}
        </div>
      </SectionCard>

      {/* Create New Person */}
      {showCreateForm && (
        <SectionCard title="Add New Staff Member">
          <form onSubmit={handleCreatePerson} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter email address"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-vm-blue-500"
                required
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="px-4 py-2 bg-vm-blue-600 text-white rounded-md hover:bg-vm-blue-700 focus:outline-none focus:ring-2 focus:ring-vm-blue-500"
              >
                Add Staff Member
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
            </div>
          </form>
        </SectionCard>
      )}

      {/* Staff Members List */}
      <SectionCard title="All Staff Members" description="Manage all staff members with platform access" className="relative">
        <div className="absolute right-6 top-6">
          {/* <p className="text-gray-600">Manage all staff members with platform access</p> */}
          {!showCreateForm && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-4 py-2 bg-vm-blue-600 text-white rounded-md hover:bg-vm-blue-700 focus:outline-none focus:ring-2 focus:ring-vm-blue-500 flex items-center space-x-2 hover:cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add Staff Member</span>
            </button>
          )}
        </div>

        {persons.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No staff members found. Add your first staff member to get started.</p>
          </div>
        ) : filteredPersons.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No staff members match your search criteria.</p>
            <button
              onClick={clearSearch}
              className="mt-2 text-vm-blue-600 hover:text-vm-blue-700 underline"
            >
              Clear search
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredPersons.map((person) => (
              <div
                key={person.id}
                className="border border-gray-200 rounded-lg p-4 bg-white hover:bg-gray-50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {person.name || 'No name provided'}
                    </h3>
                    <p className="text-gray-600 flex items-center">
                      <Mail className="h-4 w-4 mr-1" />
                      {person.email}
                    </p>
                    <p className="text-sm text-gray-500">
                      Added: {formatDate(person.created_at)}
                    </p>
                    {person.updated_at !== person.created_at && (
                      <p className="text-sm text-gray-500">
                        Updated: {formatDate(person.updated_at)}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleDeletePerson(person.email)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-md"
                      title="Delete staff member"
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

      {/* Statistics */}
      <SectionCard title="Statistics">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-600">Total Staff</p>
                <p className="text-2xl font-bold text-blue-900">{persons.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <Search className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-green-600">
                  {searchQuery ? 'Filtered Results' : 'Active Members'}
                </p>
                <p className="text-2xl font-bold text-green-900">
                  {searchQuery ? filteredPersons.length : persons.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center">
              <UserPlus className="h-8 w-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-purple-600">Recently Added</p>
                <p className="text-2xl font-bold text-purple-900">
                  {persons.filter(p => {
                    const createdDate = new Date(p.created_at);
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return createdDate > weekAgo;
                  }).length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
