"use client";

import { useEffect } from "react";

import { useRouter } from "next/navigation";

import { useApp } from "@/providers/AppProvider";

export default function HomePage() {
  const router = useRouter();

  const { user, isInitialized } = useApp();

  useEffect(() => {
    if (!isInitialized) {
      return;
    }

    if (!user) {
      router.replace("/auth");
      return;
    }

    if (user.role === "SALES_PERSON") {
      router.replace("/sales-pos");
      return;
    }

    router.replace("/dashboard");
  }, [isInitialized, user, router]);

  return null;
}