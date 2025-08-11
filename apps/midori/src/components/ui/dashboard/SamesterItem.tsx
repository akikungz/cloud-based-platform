"use client";
import { type Samester, SamesterItemContext } from "@midori/contexts/staff/samester";
import EditIcon from "@mui/icons-material/Edit";
import { Button, Skeleton } from "@mui/material";
import { useContext } from "react";

export const SamesterItem = ({ id, name, start_date, end_date }: Samester) => {
  const { setSamesterItem } = useContext(SamesterItemContext);

  const handleEdit = () => setSamesterItem({ id, name, start_date, end_date });

  return (
    <div className="grid md:grid-cols-2 p-4 gap-4 border-b border-gray-200 bg-white rounded-lg shadow-sm">
      <div className="space-y-1">
        <h3 className="text-lg font-semibold">{name}</h3>
        <p className="text-sm text-gray-500">
          { start_date.toDateString() } - { end_date.toDateString() }
        </p>
      </div>

      <div className="flex justify-end items-center gap-2">
        <Button 
          variant="outlined" 
          color="primary" 
          size="small"
          onClick={handleEdit} 
          endIcon={<EditIcon />}
        >
          Edit
        </Button>
      </div>
    </div>
  );
};

export const SamesterItemSkeleton = () => {
  return (
    <div className="grid md:grid-cols-2 p-4 gap-4 border-b border-gray-200 bg-white rounded-lg shadow-sm">
      <div>
        <h3 className="text-lg font-semibold">
          <Skeleton variant="text" width="80%" />
        </h3>
        <p className="text-sm text-gray-500">
          <Skeleton variant="text" width="40%" />
        </p>
      </div>
      <div className="flex justify-end">
        <Skeleton variant="rectangular" width={100} height={36} />
      </div>
    </div>
  );
}
