"use client";

import { useState, useEffect } from 'react';
import { momoi_client } from '@midori/libs/momoi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@midori/components/ui/card';
import { Loader2, Clock, CheckCircle, XCircle, AlertCircle, Eye, Trash2, ClipboardList, Plus } from 'lucide-react';
import { Button, Snackbar, Alert } from '@mui/material';
import { formatRelativeDate, formatDate } from '@midori/utils/format';

interface InstanceRequest {
  id: number;
  title: string;
  type: string;
  state: string;
  reason: string | null;
  hostname: string;
  created_at: Date;
  updated_at: Date;
}

interface ExtensionRequest {
  id: number;
  title: string;
  state: string;
  reason: string | null;
  instance_id: number;
  created_at: Date;
  updated_at: Date;
}

interface RequestManagerProps {
  refreshTrigger?: number;
  onRefresh?: () => void;
}

interface RequestWithType extends InstanceRequest {
  requestType: 'instance';
}

interface ExtensionRequestWithType extends ExtensionRequest {
  requestType: 'extension';
}

export function RequestManager({ refreshTrigger, onRefresh }: RequestManagerProps) {
  const [requests, setRequests] = useState<InstanceRequest[]>([]);
  const [extendRequests, setExtendRequests] = useState<ExtensionRequest[]>([]);
  const [instances, setInstances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<RequestWithType | ExtensionRequestWithType | null>(null);
  const [creatingInstance, setCreatingInstance] = useState<number | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success"
  });

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);

    try {
      const [requestsResult, instancesResult] = await Promise.all([
        momoi_client.api.v1.student.requests.get(),
        momoi_client.api.v1.student.instances.get()
      ]);

      if (requestsResult.error) {
        throw new Error(requestsResult.error.value.message || 'Failed to fetch requests');
      }

      if (instancesResult.error) {
        throw new Error(instancesResult.error.value.message || 'Failed to fetch instances');
      }

      const requestsData = requestsResult.data?.data || requestsResult.data;
      const instancesData = instancesResult.data?.data || instancesResult.data;

      if (requestsData) {
        setRequests(requestsData.requests || []);
        setExtendRequests(requestsData.extend_requests || []);
      }

      if (instancesData) {
        setInstances(Array.isArray(instancesData) ? instancesData : []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch requests');
      console.error('Error fetching requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [refreshTrigger]);

  const handleCreateInstance = async (requestId: number) => {
    setCreatingInstance(requestId);
    try {
      const result = await momoi_client.api.v1.student.requests["create-instance"].post({
        request_id: requestId
      });

      if (result.error) {
        setSnackbar({
          open: true,
          message: result.error.value?.message || 'Failed to create instance',
          severity: "error"
        });
      } else {
        setSnackbar({
          open: true,
          message: "Instance created successfully! It may take a few minutes to be ready.",
          severity: "success"
        });
        // Refresh the requests to update the UI
        fetchRequests();
        onRefresh?.();
      }
    } catch (err) {
      console.error("Error creating instance:", err);
      setSnackbar({
        open: true,
        message: "Failed to create instance",
        severity: "error"
      });
    } finally {
      setCreatingInstance(null);
    }
  };

  const getStateIcon = (state: string) => {
    switch (state.toLowerCase()) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStateColor = (state: string) => {
    switch (state.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewRequest = (request: RequestWithType | ExtensionRequestWithType) => {
    setSelectedRequest(request);
  };

  const handleCloseModal = () => {
    setSelectedRequest(null);
  };

  // Helper function to check if an instance exists for a request
  const hasInstanceForRequest = (request: InstanceRequest): boolean => {
    return instances.some(instance =>
      instance.hostname === request.hostname &&
      instance.state !== 'deleted'
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Request History</CardTitle>
          <CardDescription>Your submitted requests and their status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Loading requests...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Request History</CardTitle>
          <CardDescription>Your submitted requests and their status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-center space-x-2">
            <XCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchRequests}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Retry
          </button>
        </CardContent>
      </Card>
    );
  }


  const allRequests: (RequestWithType | ExtensionRequestWithType)[] = [
    ...requests.map(req => ({ ...req, requestType: 'instance' as const })),
    ...extendRequests.map(req => ({ ...req, requestType: 'extension' as const }))
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <CardTitle>Request History</CardTitle>
              <CardDescription>Your submitted requests and their status</CardDescription>
            </div>
            <button
              onClick={fetchRequests}
              className="flex items-center space-x-2 px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <Loader2 className="h-4 w-4" />
              <span>Refresh</span>
            </button>
          </div>
        </CardHeader>
        <CardContent>
          {allRequests.length === 0 ? (
            <div className="text-center py-8">
              <ClipboardList className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No requests found.</p>
              <p className="text-gray-600 mt-2">Submit your first request to get started.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {allRequests.map((request) => (
                <div
                  key={`${request.requestType}-${request.id}`}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3 flex-1">
                    {getStateIcon(request.state)}
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{request.title}</h4>
                      <p className="text-sm text-gray-600">
                        {request.requestType === 'instance' ? 'Instance Request' : 'Extension Request'}
                        {request.requestType === 'instance' && (request as InstanceRequest).type &&
                          ` • ${(request as InstanceRequest).type}`
                        }
                        {request.requestType === 'instance' && (request as InstanceRequest).hostname &&
                          ` • ${(request as InstanceRequest).hostname}`
                        }
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {/* Show Create Instance button for approved instance requests that don't have an instance yet */}
                    {/* {request.requestType === 'instance' && 
                     request.state === 'approved' && 
                     !hasInstanceForRequest(request as InstanceRequest) && (
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => handleCreateInstance(request.id)}
                        disabled={creatingInstance === request.id}
                        startIcon={<Plus className="w-4 h-4" />}
                        style={{ marginRight: "4px" }}
                      >
                        {creatingInstance === request.id ? "Creating..." : "Create Instance"}
                      </Button>
                    )} */}
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStateColor(request.state)}`}>
                      {request.state}
                    </span>
                    <button
                      onClick={() => handleViewRequest(request)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                      title="View details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="text-xs text-gray-500 ml-4">
                    {formatRelativeDate(request.created_at)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Request Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Request Details</h3>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Title</label>
                    <p className="text-sm text-gray-900">{selectedRequest.title}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Status</label>
                    <div className="flex items-center space-x-2">
                      {getStateIcon(selectedRequest.state)}
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStateColor(selectedRequest.state)}`}>
                        {selectedRequest.state}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Created</label>
                    <p className="text-sm text-gray-900">{formatDate(selectedRequest.created_at)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Last Updated</label>
                    <p className="text-sm text-gray-900">{formatDate(selectedRequest.updated_at)}</p>
                  </div>
                </div>

                {selectedRequest.reason && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Reason</label>
                    <p className="text-sm text-gray-900">{selectedRequest.reason}</p>
                  </div>
                )}

                {selectedRequest.requestType === 'instance' && (selectedRequest as InstanceRequest).hostname && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Hostname</label>
                    <p className="text-sm text-gray-900">{(selectedRequest as InstanceRequest).hostname}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
