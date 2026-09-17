
// src/app/(public)/layout.tsx

"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { SalesPersonShell } from "@/components/SalesShell";
import { useApp } from "@/providers/AppProvider";

export default function SalesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const { user, business, signOut, isInitialized } = useApp();

  useEffect(() => {
    if (!isInitialized) {
      return;
    }

    // No authenticated user
    if (!user) {
      router.replace(
        `/auth?redirect=${encodeURIComponent(pathname)}`,
      );
      return;
    }

    // Only sales persons are allowed in sales routes
    if (user.role !== "SALES_PERSON") {
      router.replace("/dashboard");
    }
  }, [isInitialized, user, pathname, router]);

  // Prevent rendering protected content while authentication
  // is being resolved
  if (!isInitialized) {
    return null;
  }

  if (!user) {
    return null;
  }

  // Prevent rendering the sales shell for non-sales users
  if (user.role !== "SALES_PERSON") {
    return null;
  }

  return (
    <SalesPersonShell
      business={business}
      user={user}
      onSignOut={signOut}
    >
      {children}
    </SalesPersonShell>
  );
}
