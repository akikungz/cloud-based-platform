"use client";
import PendingItemModal from "@midori/components/ui/dashboard/PendingItemModal";
import { createContext, useContext, useState } from "react";

export interface PendingRequestItemProps {
  id: string; // Optional ID for the request
  title: string;
  description: string;
  requestedBy: {
    id: string;
    name: string;
    email: string;
  };
  course: {
    id: string;
    code: string;
    name: string;
  };
  spec: {
    os: string;
    cpu: number;
    memory: number;
    storage: number;
  };
}

export interface PendingItemContextProps {
  pendingItem: PendingRequestItemProps | null;
  setPendingItem: (item: PendingRequestItemProps | null) => void;
}

const PendingItemContext = createContext<PendingItemContextProps>({
  pendingItem: null,
  setPendingItem: () => {},
});

export const PendingItemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pendingItem, setPendingItem] = useState<PendingRequestItemProps | null>(null);

  return (
    <PendingItemContext.Provider value={{ pendingItem, setPendingItem }}>
      {
        pendingItem && <PendingItemModal item={pendingItem} onClose={() => setPendingItem(null)} />
      }
      {children}
    </PendingItemContext.Provider>
  );
};

export const usePendingItem = (): PendingItemContextProps => {
  const context = useContext(PendingItemContext);
  if (!context) {
    throw new Error("usePendingItem must be used within a PendingItemProvider");
  }
  return context;
};