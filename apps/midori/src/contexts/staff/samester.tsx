"use client";
import { createContext, useContext, useEffect, useState } from "react";

export interface Samester {
  id: string;
  name: string;
  start_date: Date;
  end_date: Date;
}

// Samesters
export interface SamesterContextProps {
  samesters: Samester[];
  setSamesters: (samesters: Samester[]) => void;
}

export const SamesterContext = createContext<SamesterContextProps>({
  samesters: [],
  setSamesters: () => {},
});

export const SamesterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [samesters, setSamesters] = useState<Samester[]>([]);

  useEffect(() => {
    const fetchSamesters = async () => {
      // Mockup
      const mockSamesters: Samester[] = [
        {
          id: "1",
          name: "1/2568",
          start_date: new Date("2025-06-23"),
          end_date: new Date("2025-11-24"),
        },
        {
          id: "2",
          name: "2/2568",
          start_date: new Date("2025-11-24"),
          end_date: new Date("2026-04-24"),
        }
      ];

      setSamesters(mockSamesters);
    }

    fetchSamesters();
  }, []);

  return (
    <SamesterContext.Provider value={{ samesters, setSamesters }}>
      {children}
    </SamesterContext.Provider>
  );
};

export const useSamesters = (): SamesterContextProps => {
  const context = useContext(SamesterContext);
  if (!context) {
    throw new Error("useSamesters must be used within a SamesterProvider");
  }
  return context;
};

// Samester Item
export interface SamesterItemContextProps {
  samesterItem: Samester | null;
  setSamesterItem: (item: Samester | null) => void;
}

export const SamesterItemContext = createContext<SamesterItemContextProps>({
  samesterItem: null,
  setSamesterItem: () => {},
});

export const SamesterItemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [samesterItem, setSamesterItem] = useState<Samester | null>(null);

  return (
    <SamesterItemContext.Provider value={{ samesterItem, setSamesterItem }}>
      {children}
    </SamesterItemContext.Provider>
  );
};

export const useSamesterItem = (): SamesterItemContextProps => {
  const context = useContext(SamesterItemContext);
  if (!context) {
    throw new Error("useSamesterItem must be used within a SamesterItemProvider");
  }
  return context;
}
