"use client";

import { useState, useEffect } from "react";
import { PageHeader, SectionCard, SearchInput, LoadingSpinner, AlertMessage } from "@midori/components/ui";
import { momoi_client } from "@midori/libs/momoi";
import { Plus, Users, User, Trash2, UserPlus, Mail, Search } from "lucide-react";
import { formatDate } from "@midori/utils/format";

interface Person {
  id: string | null;
  email: string;
  name?: string | null;
  role?: string;
  staff_id: number;
  created_at: Date;
  updated_at: Date;
  status: 'active' | 'pending';
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
      const result = await momoi_client.api.v1.staff.persons.get({
        query: {}
      });
      if (result.error) {
        throw new Error(result.error.value.message || 'Failed to fetch staff members');
      }
      // Handle the API response structure: { message: string, data: Person[] }
      const personsData = (result.data! as unknown as any).data || result.data;
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
      (person.name && person.name.toLowerCase().includes(query)) ||
      person.status.toLowerCase().includes(query)
    );
  });

  // Create new person
  const handleCreatePerson = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await momoi_client.api.v1.staff.persons.post({ email: formData.email });
      if (result.error) {
        throw new Error(result.error.value.message || 'Failed to create person');
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
        throw new Error(result.error.value.message || 'Failed to delete person');
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
        <LoadingSpinner size="xl" text="Loading staff members..." />
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
        <AlertMessage
          type="error"
          message={error}
          dismissible
          onDismiss={() => setError(null)}
        />
      )}

      {/* Search Section */}
      <SectionCard title="Search Staff Members">
        <div className="space-y-4">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by name or email address..."
          />
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
                key={person.staff_id}
                className={`border rounded-lg p-4 hover:bg-gray-50 ${person.status === 'pending'
                    ? 'border-yellow-200 bg-yellow-50'
                    : 'border-gray-200 bg-white'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {person.status === 'pending' ? 'Pending Staff Member' : (person.name || 'No name provided')}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${person.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                        }`}>
                        {person.status === 'pending' ? 'Pending' : 'Active'}
                      </span>
                    </div>
                    <p className="text-gray-600 flex items-center">
                      <Mail className="h-4 w-4 mr-1" />
                      {person.email}
                    </p>
                    {person.status === 'pending' && (
                      <p className="text-sm text-yellow-600 mt-1">
                        <User className="h-3 w-3 inline mr-1" />
                        Staff member has not logged in yet
                      </p>
                    )}
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              <User className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-green-600">Active Members</p>
                <p className="text-2xl font-bold text-green-900">
                  {persons.filter(p => p.status === 'active').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <UserPlus className="h-8 w-8 text-yellow-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-yellow-600">Pending Members</p>
                <p className="text-2xl font-bold text-yellow-900">
                  {persons.filter(p => p.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center">
              <Search className="h-8 w-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-purple-600">
                  {searchQuery ? 'Filtered Results' : 'Recently Added'}
                </p>
                <p className="text-2xl font-bold text-purple-900">
                  {searchQuery ? filteredPersons.length : persons.filter(p => {
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
