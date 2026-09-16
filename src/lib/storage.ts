import type { AppState } from "@/types/types";
import {
  createSeedSales,
  seedBusiness,
  seedProducts,
  seedUsers,
} from "../data/seed";

export const STORAGE_KEY = "pos-state-v1";
export const SESSION_KEY = "pos-session";

export function createInitialState(): AppState {
  return {
    business: { ...seedBusiness },
    users: [...seedUsers],
    products: [...seedProducts],
    sales: createSeedSales(),
  };
}

export function loadState(): AppState {
  if (typeof window === "undefined") {
    return createInitialState();
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return createInitialState();
    }

    const parsed: unknown = JSON.parse(stored);

    if (!isValidAppState(parsed)) {
      return createInitialState();
    }

    return parsed;
  } catch {
    return createInitialState();
  }
}

export function saveState(state: AppState): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(state),
    );
  } catch {
    // Ignore storage failures.
  }
}

export function getSessionId(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}

export function setSessionId(id: string): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(SESSION_KEY, id);
  } catch {
    // Ignore storage failures.
  }
}

export function clearSession(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.removeItem(SESSION_KEY);
  } catch {
    // Ignore storage failures.
  }
}

function isValidAppState(value: unknown): value is AppState {
  if (!value || typeof value !== "object") {
    return false;
  }

  const state = value as Record<string, unknown>;

  return (
    !!state.business &&
    typeof state.business === "object" &&
    Array.isArray(state.users) &&
    Array.isArray(state.products) &&
    Array.isArray(state.sales)
  );
}