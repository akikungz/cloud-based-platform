"use client";

import { useState, useEffect } from 'react';
import { momoi_client } from '@midori/libs/momoi';
import { formatDate } from '@midori/utils/format';

interface ApprovalRequest {
  id: number;
  title: string;
  description: string;
  type: string;
  hostname: string;
  course_id: number;
  template_id: number;
  cpus: number;
  memory: number;
  disk: number;
  created_at: string;
  user_id: number;
}

interface ExtensionRequest {
  id: number;
  instance_id: number;
  title: string;
  description: string;
  created_at: string;
  user_id: number;
}

export function StaffApprovalManager() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [approvals, setApprovals] = useState<any | null>(null);
  const [extensions, setExtensions] = useState<any | null>(null);
  const [selectedRequests, setSelectedRequests] = useState<number[]>([]);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [approvalsResult, extensionsResult] = await Promise.all([
        momoi_client.api.v1.staff.approval.get({
          query: {}
        }),
        momoi_client.api.v1.staff.approval.extends.get({
          query: {}
        })
      ]);
      
      if (approvalsResult.error) throw new Error(approvalsResult.error.value.message || 'Failed to fetch approvals');
      if (extensionsResult.error) throw new Error(extensionsResult.error.value.message || 'Failed to fetch extensions');
      
      // Handle the API response structure: { message: string, data: T }
      const approvalsData = approvalsResult.data?.data || approvalsResult.data;
      const extensionsData = extensionsResult.data?.data || extensionsResult.data;
      
      setApprovals(approvalsData);
      setExtensions(extensionsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch approval data');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: number) => {
    try {
      const result = await momoi_client.api.v1.staff.approval.approve.post({ request_id: requestId });
      if (result.error) {
        throw new Error(result.error.value.message || 'Failed to approve request');
      }
      await fetchData(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve request');
    }
  };

  const handleReject = async (requestId: number, reason: string) => {
    try {
      const result = await momoi_client.api.v1.staff.approval.reject.post({ request_id: requestId, reason });
      if (result.error) {
        throw new Error(result.error.value.message || 'Failed to reject request');
      }
      await fetchData(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject request');
    }
  };

  const handleApproveExtension = async (requestId: number) => {
    try {
      const result = await momoi_client.api.v1.staff.approval.extends.approve.post({ request_id: requestId });
      if (result.error) {
        throw new Error(result.error.value.message || 'Failed to approve extension');
      }
      await fetchData(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve extension');
    }
  };

  const handleRejectExtension = async (requestId: number, reason: string) => {
    try {
      const result = await momoi_client.api.v1.staff.approval.extends.reject.post({ request_id: requestId, reason });
      if (result.error) {
        throw new Error(result.error.value.message || 'Failed to reject extension');
      }
      await fetchData(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject extension');
    }
  };

  const handleBatchApprove = async () => {
    if (selectedRequests.length === 0) return;
    
    try {
      const results = await Promise.allSettled(
        selectedRequests.map(id => momoi_client.api.v1.staff.approval.approve.post({ request_id: id }))
      );
      const processedResults = results.map((result, index) => ({
        id: selectedRequests[index],
        success: result.status === 'fulfilled',
        error: result.status === 'rejected' ? result.reason : null,
      }));
      const failedRequests = processedResults.filter(r => !r.success);
      
      if (failedRequests.length > 0) {
        setError(`Failed to approve ${failedRequests.length} requests`);
      }
      
      setSelectedRequests([]);
      await fetchData(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to batch approve requests');
    }
  };

  const handleBatchReject = async () => {
    if (selectedRequests.length === 0 || !rejectReason.trim()) return;
    
    try {
      const results = await Promise.allSettled(
        selectedRequests.map(id => momoi_client.api.v1.staff.approval.reject.post({ request_id: id, reason: rejectReason }))
      );
      const processedResults = results.map((result, index) => ({
        id: selectedRequests[index],
        success: result.status === 'fulfilled',
        error: result.status === 'rejected' ? result.reason : null,
      }));
      const failedRequests = processedResults.filter(r => !r.success);
      
      if (failedRequests.length > 0) {
        setError(`Failed to reject ${failedRequests.length} requests`);
      }
      
      setSelectedRequests([]);
      setRejectReason('');
      setShowRejectModal(false);
      await fetchData(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to batch reject requests');
    }
  };

  const toggleRequestSelection = (requestId: number) => {
    setSelectedRequests(prev => 
      prev.includes(requestId) 
        ? prev.filter(id => id !== requestId)
        : [...prev, requestId]
    );
  };

  const selectAllRequests = () => {
    if (approvals?.data) {
      setSelectedRequests(approvals.data.map((req: any) => req.id));
    }
  };

  const clearSelection = () => {
    setSelectedRequests([]);
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <span className="ml-2">Loading approval data...</span>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Staff Approval Manager</h1>
        <button
          onClick={fetchData}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}

      {/* Batch Actions */}
      {selectedRequests.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-blue-800">
              {selectedRequests.length} request(s) selected
            </span>
            <div className="flex gap-2">
              <button
                onClick={selectAllRequests}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Select All
              </button>
              <button
                onClick={clearSelection}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Clear Selection
              </button>
              <button
                onClick={handleBatchApprove}
                className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
              >
                Approve Selected
              </button>
              <button
                onClick={() => setShowRejectModal(true)}
                className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
              >
                Reject Selected
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Regular Requests */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">
          Pending Requests ({approvals?.count || 0})
        </h2>
        
        {approvals?.data && approvals.data.length > 0 ? (
          <div className="space-y-4">
            {approvals.data.map((request: any) => (
              <div key={request.id} className="border rounded-lg p-4 bg-white shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedRequests.includes(request.id)}
                      onChange={() => toggleRequestSelection(request.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{request.title}</h3>
                      <p className="text-gray-600 mb-2">{request.description}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Type:</span> {request.type}
                        </div>
                        <div>
                          <span className="font-medium">Hostname:</span> {request.hostname}
                        </div>
                        <div>
                          <span className="font-medium">CPU:</span> {request.cpus} cores
                        </div>
                        <div>
                          <span className="font-medium">Memory:</span> {request.memory} MB
                        </div>
                        <div>
                          <span className="font-medium">Disk:</span> {request.disk} GB
                        </div>
                        <div>
                          <span className="font-medium">Course ID:</span> {request.course_id}
                        </div>
                        <div>
                          <span className="font-medium">Template ID:</span> {request.template_id}
                        </div>
                        <div>
                          <span className="font-medium">Created:</span> {formatDate(request.created_at)}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleApprove(request.id)}
                      className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        setSelectedRequests([request.id]);
                        setShowRejectModal(true);
                      }}
                      className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No pending requests found.
          </div>
        )}
      </div>

      {/* Extension Requests */}
      <div>
        <h2 className="text-xl font-semibold mb-4">
          Pending Extensions ({extensions?.count || 0})
        </h2>
        
        {extensions?.data && extensions.data.length > 0 ? (
          <div className="space-y-4">
            {extensions.data.map((request: any) => (
              <div key={request.id} className="border rounded-lg p-4 bg-white shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{request.title}</h3>
                    <p className="text-gray-600 mb-2">{request.description}</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Instance ID:</span> {request.instance_id}
                      </div>
                      <div>
                        <span className="font-medium">User ID:</span> {request.user_id}
                      </div>
                      <div>
                        <span className="font-medium">Created:</span> {formatDate(request.created_at)}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleApproveExtension(request.id)}
                      className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        setSelectedRequests([request.id]);
                        setShowRejectModal(true);
                      }}
                      className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No pending extension requests found.
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Reject Request(s)</h3>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter reason for rejection..."
              className="w-full p-3 border rounded-md mb-4"
              rows={3}
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleBatchReject}
                disabled={!rejectReason.trim()}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
