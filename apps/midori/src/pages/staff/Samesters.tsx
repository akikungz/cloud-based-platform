"use client";
import { SamesterModal } from "@midori/components/ui/dashboard/SamesterModal";
import { Samesters } from "@midori/components/ui/dashboard/Samesters";
import { LoadingProvider } from "@midori/contexts/loading";
import { SamesterItemProvider, SamesterProvider } from "@midori/contexts/staff/samester";
import AddIcon from "@mui/icons-material/Add";
import { Button } from "@mui/material";
import { useState } from "react";

export const SamestersPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Samesters Management</h1>
          <p>Manage samesters for control instance by samesters.</p>
        </div>

        <Button startIcon={<AddIcon />} onClick={() => setIsModalOpen(true)}>Add Samester</Button>
      </div>

      {/* Samesters List */}
      <LoadingProvider>
        <SamesterProvider>
          <SamesterItemProvider>
            <SamesterModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
            <Samesters />
          </SamesterItemProvider>
        </SamesterProvider>
      </LoadingProvider>
    </div>
  );
};

export default SamestersPage;
