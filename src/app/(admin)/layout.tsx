
// src/app/(admin)/layout.tsx

"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { AdminShell } from "@/components/AdminShell";
import { useApp } from "@/providers/AppProvider";

export default function AdminLayout({
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

  if (!user) {
    router.replace(
      `/auth?redirect=${encodeURIComponent(pathname)}`,
    );
    return;
  }

  if (user.role !== "ADMIN") {
    router.replace("/sales-pos");
  }
}, [isInitialized, user, pathname, router]);

  // Prevent protected content from rendering
  // when there is no authenticated user.
  if (!isInitialized) {
  return null;
}

if (!user) {
  return null;
}

if (user.role !== "ADMIN") {
  return null;
}

  return (
    <AdminShell
      business={business}
      user={user}
      onSignOut={signOut}
    >
      {children}
    </AdminShell>
  );
}
