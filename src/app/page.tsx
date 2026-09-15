"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { getSessionId, loadState } from "@/lib/storage";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const state = loadState();
    const sessionId = getSessionId();

    const user = state.users.find(
      (entry) => entry.id === sessionId && entry.active,
    );

    if (!user) {
      router.replace("/auth");
      return;
    }

    if (user.role === "SALES_PERSON") {
      router.replace("/sales-pos");
      return;
    }

    router.replace("/dashboard");
  }, [router]);

  return null;
}