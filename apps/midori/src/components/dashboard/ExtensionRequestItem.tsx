"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@midori/components/ui";
import { Button } from "@mui/material";
import { Check, X, Clock, User, Calendar, FileText, AlertCircle } from "lucide-react";
import { momoi_client } from "@midori/libs/momoi";
import { formatDate } from "@midori/utils/format";

export interface ExtensionRequestItemProps {
  id: number;
  title: string;
  description: string;
  instance_id: number;
  instance_title?: string;
  instance_hostname?: string;
  requestedBy?: string;
  requestedByEmail?: string;
  course?: string;
  created_at: Date;
  onRequestUpdate?: () => void;
}

export const ExtensionRequestItem: React.FC<ExtensionRequestItemProps> = ({
  id,
  title,
  description,
  instance_id,
  instance_title,
  instance_hostname,
  requestedBy,
  requestedByEmail,
  course,
  created_at,
  onRequestUpdate,
}) => {
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success"
  });

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      const result = await momoi_client.api.v1.staff.approval.extends.approve.post({
        request_id: id
      });

      if (!result.error) {
        setSnackbar({
          open: true,
          message: "Extension request approved successfully",
          severity: "success"
        });
        onRequestUpdate?.();
      } else {
        throw new Error(result.error.value.message || "Failed to approve extension request");
      }
    } catch (error) {
      console.error("Error approving extension request:", error);
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : "Failed to approve extension request",
        severity: "error"
      });
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      setSnackbar({
        open: true,
        message: "Please provide a reason for rejection",
        severity: "error"
      });
      return;
    }

    setIsRejecting(true);
    try {
      const result = await momoi_client.api.v1.staff.approval.extends.reject.post({
        request_id: id,
        reason: rejectReason
      });

      if (!result.error) {
        setSnackbar({
          open: true,
          message: "Extension request rejected successfully",
          severity: "success"
        });
        setRejectDialogOpen(false);
        setRejectReason("");
        onRequestUpdate?.();
      } else {
        throw new Error(result.error.value.message || "Failed to reject extension request");
      }
    } catch (error) {
      console.error("Error rejecting extension request:", error);
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : "Failed to reject extension request",
        severity: "error"
      });
    } finally {
      setIsRejecting(false);
    }
  };

  return (
    <>
      <Card className="w-full border-l-4 border-l-orange-500 hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-500" />
                {title}
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Extension request for instance: {instance_title || `Instance #${instance_id}`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
                Extension Request
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="space-y-4">
            {/* Description */}
            <div className="flex items-start gap-3">
              <FileText className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-gray-700">{description}</p>
              </div>
            </div>

            {/* Instance Details */}
            {instance_hostname && (
              <div className="flex items-center gap-3">
                <AlertCircle className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Instance:</span> {instance_hostname}
                  </p>
                </div>
              </div>
            )}

            {/* Requested By */}
            {(requestedBy || requestedByEmail) && (
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Requested by:</span> {requestedBy || requestedByEmail}
                  </p>
                </div>
              </div>
            )}

            {/* Course */}
            {course && (
              <div className="flex items-center gap-3">
                <AlertCircle className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Course:</span> {course}
                  </p>
                </div>
              </div>
            )}

            {/* Created Date */}
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Requested:</span> {formatDate(created_at)}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <Button
                variant="outlined"
                color="error"
                size="small"
                onClick={() => setRejectDialogOpen(true)}
                disabled={isApproving || isRejecting}
                startIcon={<X className="h-4 w-4" />}
              >
                {isRejecting ? "Rejecting..." : "Reject"}
              </Button>
              <Button
                variant="contained"
                color="success"
                size="small"
                onClick={handleApprove}
                disabled={isApproving || isRejecting}
                startIcon={<Check className="h-4 w-4" />}
              >
                {isApproving ? "Approving..." : "Approve"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reject Dialog */}
      {rejectDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Reject Extension Request
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Please provide a reason for rejecting this extension request:
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              rows={4}
            />
            <div className="flex items-center justify-end gap-3 mt-6">
              <Button
                variant="outlined"
                onClick={() => {
                  setRejectDialogOpen(false);
                  setRejectReason("");
                }}
                disabled={isRejecting}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={handleReject}
                disabled={isRejecting || !rejectReason.trim()}
              >
                {isRejecting ? "Rejecting..." : "Reject Request"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Snackbar */}
      {snackbar.open && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className={`px-4 py-3 rounded-md shadow-lg ${
            snackbar.severity === "success" 
              ? "bg-green-100 text-green-800 border border-green-200" 
              : "bg-red-100 text-red-800 border border-red-200"
          }`}>
            <div className="flex items-center gap-2">
              {snackbar.severity === "success" ? (
                <Check className="h-4 w-4" />
              ) : (
                <X className="h-4 w-4" />
              )}
              <span className="text-sm font-medium">{snackbar.message}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
