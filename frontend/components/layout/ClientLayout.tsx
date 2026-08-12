"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { AppShell } from "@/components/shell/AppShell";
import { RecruiterShell } from "@/components/shell/RecruiterShell";
import { useAuth } from "@/components/auth/AuthProvider";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const isLanding = pathname === "/";

  if (isLanding) {
    return <>{children}</>;
  }

  const isRecruiterPath = pathname.startsWith("/recruiter/") || pathname === "/recruiter";

  if (isRecruiterPath) {
    return <RecruiterShell>{children}</RecruiterShell>;
  }

  if (user?.role === "recruiter") {
    return <RecruiterShell>{children}</RecruiterShell>;
  }

  return <AppShell>{children}</AppShell>;
}
