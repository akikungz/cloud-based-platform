"use client";
import { AccessDenied } from "@midori/components/layout/AccessDenied";
import { LoadingProvider, useLoading } from "@midori/contexts/loading";
import { UserContext } from "@midori/contexts/user";
import { useContext } from "react";
import { Role } from "utils";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const { user, isPending } = useContext(UserContext);

  if (!user) {
    if (isPending) return null; // Still loading user data
    return null;
  }

  if (user.role !== Role.Staff) {
    return <AccessDenied />;
  }

  return <LoadingProvider>{children}</LoadingProvider>;
}

export default Layout;