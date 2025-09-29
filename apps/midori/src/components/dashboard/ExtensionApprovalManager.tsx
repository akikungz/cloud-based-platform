"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@midori/components/ui";
import { Button, Alert, CircularProgress, Box, Typography } from "@mui/material";
import { RefreshCw, Clock, AlertCircle, CheckCircle } from "lucide-react";
import { momoi_client } from "@midori/libs/momoi";
import { ExtensionRequestItem } from "./ExtensionRequestItem";

interface ExtensionRequest {
  id: number;
  title: string;
  description: string;
  instance_id: number;
  instance?: {
    title: string;
    hostname: string;
    user?: {
      name: string;
      email: string;
    };
    course?: {
      course_id: string;
      course_title: string;
    };
  };
  created_at: Date;
  updated_at: Date;
  state: string;
  reason?: string | null;
  instance_requestId?: number | null;
}

interface ExtensionApprovalManagerProps {
  limit?: number;
  showPagination?: boolean;
}

export const ExtensionApprovalManager: React.FC<ExtensionApprovalManagerProps> = ({
  limit = 10,
  showPagination = true,
}) => {
  const [extensions, setExtensions] = useState<ExtensionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [extensionStats, setExtensionStats] = useState({
    total: 0,
    pending: 0,
    processed: 0,
  });

  const fetchExtensionStats = async () => {
    try {
      const result = await momoi_client.api.v1.staff.approval.stats.get();

      if (!result.error) {
        const statsData = result.data?.data;
        if (statsData) {
          setExtensionStats({
            total: statsData.extensionRequests.total,
            pending: statsData.extensionRequests.pending,
            processed: statsData.extensionRequests.processed,
          });
        }
      }
    } catch (err) {
      console.error("Error fetching extension stats:", err);
    }
  };

  const fetchExtensions = async (page = 1, isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const result = await momoi_client.api.v1.staff.approval.extends.get({
        query: {
          skip: page,
          take: limit,
        }
      });

      if (result.error) {
        throw new Error(result.error.value.message || 'Failed to fetch extension requests');
      }

      const data = result.data?.data || result.data;
      if (data) {
        // Convert created_at strings to Date objects
        const processedExtensions = (data.data || []).map((ext: any) => ({
          ...ext,
          created_at: new Date(ext.created_at)
        }));
        setExtensions(processedExtensions);
        setTotalPages(data.totalPages || 1);
        setTotalCount(data.count || 0);
        setCurrentPage(page);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch extension requests');
      console.error('Error fetching extension requests:', err);
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  const handleRefresh = () => {
    fetchExtensions(currentPage, true);
    fetchExtensionStats();
  };

  const handleRequestUpdate = () => {
    fetchExtensions(currentPage, true);
  };

  const handlePageChange = (newPage: number) => {
    fetchExtensions(newPage);
  };

  useEffect(() => {
    fetchExtensions(1);
    fetchExtensionStats();
  }, [limit]);

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <CircularProgress size={40} />
            <Typography variant="body2" className="mt-4 text-gray-600">
              Loading extension requests...
            </Typography>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="py-6">
          <Alert severity="error" className="mb-4">
            {error}
          </Alert>
          <Button
            variant="outlined"
            onClick={handleRefresh}
            startIcon={<RefreshCw className="h-4 w-4" />}
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="h-6 w-6 text-orange-500" />
            <div>
              <CardTitle className="text-xl font-semibold">
                Extension Requests
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Review and approve student requests for instance extensions
              </p>
            </div>
          </div>
          <Button
            variant="outlined"
            size="small"
            onClick={handleRefresh}
            disabled={refreshing}
            startIcon={<RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />}
          >
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-orange-600">Total Requests</p>
                <p className="text-2xl font-bold text-orange-900">{extensionStats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-600">Pending</p>
                <p className="text-2xl font-bold text-blue-900">{extensionStats.pending}</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-green-600">Processed</p>
                <p className="text-2xl font-bold text-green-900">{extensionStats.processed}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Extension Requests List */}
        {extensions.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <Typography variant="h6" className="text-gray-500 mb-2">
              No Extension Requests
            </Typography>
            <Typography variant="body2" className="text-gray-400">
              There are currently no pending extension requests to review.
            </Typography>
          </div>
        ) : (
          <div className="space-y-4">
            {extensions.map((extension) => (
              <ExtensionRequestItem
                key={extension.id}
                id={extension.id}
                title={extension.title}
                description={extension.description}
                instance_id={extension.instance_id}
                instance_title={extension.instance?.title}
                instance_hostname={extension.instance?.hostname}
                requestedBy={extension.instance?.user?.name}
                requestedByEmail={extension.instance?.user?.email}
                course={extension.instance?.course ? 
                  `${extension.instance.course.course_id} - ${extension.instance.course.course_title}` : 
                  undefined
                }
                created_at={new Date(extension.created_at)}
                onRequestUpdate={handleRequestUpdate}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {showPagination && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <Button
              variant="outlined"
              size="small"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1 || refreshing}
            >
              Previous
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                if (pageNum > totalPages) return null;
                
                return (
                  <Button
                    key={pageNum}
                    variant={pageNum === currentPage ? "contained" : "outlined"}
                    size="small"
                    onClick={() => handlePageChange(pageNum)}
                    disabled={refreshing}
                    className="min-w-[40px]"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outlined"
              size="small"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages || refreshing}
            >
              Next
            </Button>
          </div>
        )}

        {/* Page Info */}
        {showPagination && totalCount > 0 && (
          <div className="text-center mt-4">
            <Typography variant="body2" className="text-gray-500">
              Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, totalCount)} of {totalCount} extension requests
            </Typography>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
