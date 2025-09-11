"use client";
import { Button } from "@mui/material";
import Link from 'next/link';

export const AccessDenied = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-2">
      <h1 className="text-2xl font-bold text-red-400">Access Denied</h1>
      <p className="text-gray-600">You do not have permission to view this page.</p>
      <Link href="/dashboard" passHref>
        <Button variant="contained" color="primary">
          Go to Dashboard
        </Button>
      </Link>
    </div>
  );
};

export default AccessDenied;