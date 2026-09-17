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

function isElectron(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.electronAPI !== "undefined"
  );
}

/**
 * Load application state.
 *
 * Electron → SQLite
 * Browser  → localStorage
 */
export async function loadState(): Promise<AppState> {
  if (isElectron()) {
    try {
      const stored = await window.electronAPI!.database.loadState();

      if (stored && isValidAppState(stored)) {
        return stored;
      }

      return createInitialState();
    } catch (error) {
      console.error("Failed to load state from SQLite, falling back to localStorage:", error);
      return loadStateFromLocalStorage();
    }
  }

  return loadStateFromLocalStorage();
}

/**
 * Save application state.
 *
 * Electron → SQLite
 * Browser  → localStorage
 */
export async function saveState(state: AppState): Promise<void> {
  if (isElectron()) {
    try {
      await window.electronAPI!.database.saveState(state);
      return;
    } catch (error) {
      console.error("Failed to save state to SQLite, falling back to localStorage:", error);
    }
  }

  saveStateToLocalStorage(state);
}

/**
 * Get the current session.
 *
 * Electron → SQLite
 * Browser  → localStorage
 */
export async function getSessionId(): Promise<string | null> {
  if (isElectron()) {
    try {
      return await window.electronAPI!.database.getSession();
    } catch (error) {
      console.error("Failed to read session from SQLite, falling back to localStorage:", error);
      return getSessionIdFromLocalStorage();
    }
  }

  return getSessionIdFromLocalStorage();
}

/**
 * Set the current session.
 *
 * Electron → SQLite
 * Browser  → localStorage
 */
export async function setSessionId(id: string): Promise<void> {
  if (isElectron()) {
    try {
      await window.electronAPI!.database.setSession(id);
      return;
    } catch (error) {
      console.error("Failed to persist session to SQLite, falling back to localStorage:", error);
    }
  }

  setSessionIdInLocalStorage(id);
}

/**
 * Clear the current session.
 *
 * Electron → SQLite
 * Browser  → localStorage
 */
export async function clearSession(): Promise<void> {
  if (isElectron()) {
    try {
      await window.electronAPI!.database.clearSession();
      return;
    } catch (error) {
      console.error("Failed to clear session in SQLite, falling back to localStorage:", error);
    }
  }

  clearSessionFromLocalStorage();
}

/* -------------------------------------------------------------------------- */
/* LocalStorage fallback                                                      */
/* -------------------------------------------------------------------------- */

function loadStateFromLocalStorage(): AppState {
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
  } catch (error) {
    console.error("Failed to load state from localStorage:", error);
    return createInitialState();
  }
}

function saveStateToLocalStorage(state: AppState): void {
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(state),
    );
  } catch (error) {
    console.error("Failed to save state to localStorage:", error);
  }
}

function getSessionIdFromLocalStorage(): string | null {
  try {
    return window.localStorage.getItem(SESSION_KEY);
  } catch (error) {
    console.error("Failed to read session from localStorage:", error);
    return null;
  }
}

function setSessionIdInLocalStorage(id: string): void {
  try {
    window.localStorage.setItem(SESSION_KEY, id);
  } catch (error) {
    console.error("Failed to persist session to localStorage:", error);
  }
}

function clearSessionFromLocalStorage(): void {
  try {
    window.localStorage.removeItem(SESSION_KEY);
  } catch (error) {
    console.error("Failed to clear session in localStorage:", error);
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