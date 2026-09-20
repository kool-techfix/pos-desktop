import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  database: {
    loadState: () => ipcRenderer.invoke("db:load-state"),

    saveState: (state: unknown) =>
      ipcRenderer.invoke("db:save-state", state),

    getSession: () =>
      ipcRenderer.invoke("db:get-session"),

    setSession: (userId: string) =>
      ipcRenderer.invoke("db:set-session", userId),

    clearSession: () =>
      ipcRenderer.invoke("db:clear-session"),
  },

  printer: {
    print: (payload: { sale: unknown; business: unknown }) =>
      ipcRenderer.invoke("printer:print", payload),
  },
});