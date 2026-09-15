// src/app/(sales)/layout.tsx

"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  clearSession,
  getSessionId,
  loadState,
} from "@/lib/storage";
import type { AppState, User } from "@/types/types";
import { SalesPersonShell } from "@/components/SalesShell";

export default function SalesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [state, setState] = useState<AppState | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const appState = loadState();
    const sessionId = getSessionId();

    const currentUser = appState.users.find(
      (entry) => entry.id === sessionId && entry.active,
    );

    setState(appState);
    setUser(currentUser ?? null);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (isLoading) return;

    // No authenticated user
    if (!user) {
      router.replace(`/auth?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    // Sales persons are not allowed inside admin routes
    if (user.role !== "ADMIN") {
      router.replace("/pos");
    }
  }, [user, isLoading, pathname, router]);

  const signOut = () => {
    clearSession();
    setUser(null);
    router.replace("/auth");
  };

  // Prevent rendering protected content while authentication is being checked
  if (isLoading || !state || !user) {
    return null;
  }

  // Extra protection against rendering the sales person shell for non-admin users
  if (user.role !== "SALES_PERSON") {
    return null;
  }

  return (
    <SalesPersonShell
      business={state.business}
      user={user}
      onSignOut={signOut}
    >
      {children}
    </SalesPersonShell>
  );
}