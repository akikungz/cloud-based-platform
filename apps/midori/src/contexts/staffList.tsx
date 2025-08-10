"use client";
import { createContext, useContext, useState } from "react";

export interface Staff {
  id: string;
  name: string;
  email: string;
}

export interface StaffContext {
  staffList: Staff[];
  setStaffList: (staff: Staff[]) => void;
}

export const StaffContext = createContext<StaffContext>({
  staffList: [],
  setStaffList: () => {},
});

export const StaffProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [staffList, setStaffList] = useState<Staff[]>([
    // Mockup staff
    { id: "1", name: "Alice", email: "alice@example.com" },
    { id: "2", name: "Bob", email: "bob@example.com" },
    { id: "3", name: "Charlie", email: "charlie@example.com" },
    { id: "4", name: "David", email: "david@example.com" },
    { id: "5", name: "Eve", email: "eve@example.com" },
    { id: "6", name: "Frank", email: "frank@example.com" },
  ]);

  return (
    <StaffContext.Provider value={{ staffList, setStaffList }}>
      {children}
    </StaffContext.Provider>
  );
}

export const useStaff = () => {
  const context = useContext(StaffContext);
  if (!context) {
    throw new Error("useStaff must be used within a StaffProvider");
  }
  return context;
};
