"use client";

import { useState, useEffect } from 'react';
import { momoi_client } from '@midori/libs/momoi';

// Example component showing how to use the API client
export function ApiUsageExamples() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  // Example: Fetch pending approvals (Staff only)
  const fetchPendingApprovals = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await momoi_client.api.v1.staff.approval.get({ skip: 1, take: 10 });
      if (result.error) {
        throw new Error(result.error.message || 'API request failed');
      }
      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch approvals');
    } finally {
      setLoading(false);
    }
  };

  // Example: Fetch student instances
  const fetchStudentInstances = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await momoi_client.api.v1.student.instances.get();
      if (result.error) {
        throw new Error(result.error.message || 'API request failed');
      }
      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch instances');
    } finally {
      setLoading(false);
    }
  };

  // Example: Fetch autocomplete data
  const fetchAutocompleteData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [coursesResult, staffResult, templatesResult] = await Promise.all([
        momoi_client.api.v1.autocomplete.course.get(),
        momoi_client.api.v1.autocomplete.staff.get(),
        momoi_client.api.v1.autocomplete.template.get(),
      ]);
      
      if (coursesResult.error) throw new Error(coursesResult.error.message || 'Failed to fetch courses');
      if (staffResult.error) throw new Error(staffResult.error.message || 'Failed to fetch staff');
      if (templatesResult.error) throw new Error(templatesResult.error.message || 'Failed to fetch templates');
      
      // Handle the API response structure: { message: string, data: T }
      const coursesData = coursesResult.data?.data || coursesResult.data;
      const staffData = staffResult.data?.data || staffResult.data;
      const templatesData = templatesResult.data?.data || templatesResult.data;
      
      setData({ 
        courses: coursesData, 
        staff: staffData, 
        templates: templatesData 
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch autocomplete data');
    } finally {
      setLoading(false);
    }
  };

  // Example: Create a new student request
  const createStudentRequest = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await momoi_client.api.v1.student.requests.post({
        title: "New VM Request",
        description: "Request for a new virtual machine",
        type: "CREATE",
        hostname: "student-vm-001",
        course_id: 1,
        template_id: 1,
        cpus: 2,
        memory: 2048,
        disk: 16,
      });
      if (result.error) {
        throw new Error(result.error.message || 'API request failed');
      }
      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create request');
    } finally {
      setLoading(false);
    }
  };

  // Example: Approve multiple requests (Staff only)
  const batchApproveRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const requestIds = [1, 2, 3]; // Example request IDs
      const results = await Promise.allSettled(
        requestIds.map(id => momoi_client.api.v1.staff.approval.approve.post({ request_id: id }))
      );
      const processedResults = results.map((result, index) => ({
        id: requestIds[index],
        success: result.status === 'fulfilled',
        error: result.status === 'rejected' ? result.reason : null,
      }));
      setData(processedResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve requests');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">API Usage Examples</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <button
          onClick={fetchPendingApprovals}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Fetch Pending Approvals (Staff)
        </button>
        
        <button
          onClick={fetchStudentInstances}
          disabled={loading}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
        >
          Fetch Student Instances
        </button>
        
        <button
          onClick={fetchAutocompleteData}
          disabled={loading}
          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50"
        >
          Fetch Autocomplete Data
        </button>
        
        <button
          onClick={createStudentRequest}
          disabled={loading}
          className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 disabled:opacity-50"
        >
          Create Student Request
        </button>
        
        <button
          onClick={batchApproveRequests}
          disabled={loading}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50"
        >
          Batch Approve Requests (Staff)
        </button>
      </div>

      {loading && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-2">Loading...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}

      {data && (
        <div className="bg-gray-100 border border-gray-300 rounded p-4">
          <h3 className="text-lg font-semibold mb-2">Response Data:</h3>
          <pre className="text-sm overflow-auto max-h-96">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

// Example hook for managing API state
export function useApiState<T>() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T | null>(null);

  const execute = async (apiCall: () => Promise<T>) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiCall();
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'API request failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setLoading(false);
    setError(null);
    setData(null);
  };

  return { loading, error, data, execute, reset };
}

// Example component using the custom hook
export function StaffApprovalsManager() {
  const { loading, error, data, execute } = useApiState<any>();

  const fetchApprovals = () => {
    execute(async () => {
      const result = await momoi_client.api.v1.staff.approval.get({ skip: 1, take: 10 });
      if (result.error) {
        throw new Error(result.error.message || 'API request failed');
      }
      if (!result.data) {
        throw new Error('No data received from API');
      }
      return result.data;
    });
  };

  const approveRequest = async (requestId: number) => {
    try {
      const result = await momoi_client.api.v1.staff.approval.approve.post({ request_id: requestId });
      if (result.error) {
        throw new Error(result.error.message || 'Failed to approve request');
      }
      // Refresh the list after approval
      fetchApprovals();
    } catch (err) {
      console.error('Failed to approve request:', err);
    }
  };

  const rejectRequest = async (requestId: number, reason: string) => {
    try {
      const result = await momoi_client.api.v1.staff.approval.reject.post({ request_id: requestId, reason });
      if (result.error) {
        throw new Error(result.error.message || 'Failed to reject request');
      }
      // Refresh the list after rejection
      fetchApprovals();
    } catch (err) {
      console.error('Failed to reject request:', err);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Staff Approvals Manager</h2>
      
      {loading && <p>Loading approvals...</p>}
      {error && <p className="text-red-600">Error: {error}</p>}
      
      {data && (
        <div>
          <p>Total approvals: {data.count}</p>
          <div className="space-y-2">
            {data.data?.map((approval: any) => (
              <div key={approval.id} className="border p-4 rounded">
                <h3>{approval.title}</h3>
                <p>{approval.description}</p>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => approveRequest(approval.id)}
                    className="bg-green-500 text-white px-3 py-1 rounded text-sm"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => rejectRequest(approval.id, "Not approved")}
                    className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
