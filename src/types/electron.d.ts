import type { AppState, Business, Sale } from "./types";

declare global {
  interface Window {
    electronAPI?: {
      database: {
        loadState: () => Promise<AppState | null>;
        saveState: (state: AppState) => Promise<void>;
        getSession: () => Promise<string | null>;
        setSession: (userId: string) => Promise<void>;
        clearSession: () => Promise<void>;
      };
      printer: {
        print: (payload: { sale: Sale; business: Business }) => Promise<void>;
      };
    };
  }
}

export {};