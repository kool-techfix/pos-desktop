import { app, BrowserWindow, ipcMain, utilityProcess } from "electron";
import {
  closeDatabase,
  getDatabase,
} from "./database";
import { printReceipt } from "./printer";
import path from "path";
import type { Business, Sale } from "../src/types/types";

const isProduction = app.isPackaged || process.env.ELECTRON_PROD === "true";

let mainWindow: BrowserWindow | null = null;
let nextServer: ReturnType<typeof utilityProcess.fork> | null = null;

const PORT = 3000;
const HOST = "127.0.0.1";

function startNextServer() {
  const standalonePath = app.isPackaged
    ? path.join(process.resourcesPath, ".next", "standalone", "server.js")
    : path.join(process.cwd(), ".next", "standalone", "server.js");

  const standaloneDir = path.dirname(standalonePath);

  const standaloneNodeModules = path.join(standaloneDir, "node_modules");

  console.log("Next standalone path:", standalonePath);
  console.log("Next standalone directory:", standaloneDir);
  console.log("Next node_modules:", standaloneNodeModules);

  nextServer = utilityProcess.fork(standalonePath, [], {
    cwd: standaloneDir,
    env: {
      ...process.env,
      NODE_ENV: "production",
      PORT: String(PORT),
      HOSTNAME: HOST,
      NODE_PATH: standaloneNodeModules,
    },
    stdio: "pipe",
    serviceName: "Bluebird POS Next Server",
  });

  nextServer.stdout?.on("data", (data) => {
    console.log(`[Next] ${data.toString().trim()}`);
  });

  nextServer.stderr?.on("data", (data) => {
    console.error(`[Next] ${data.toString().trim()}`);
  });

  nextServer.on("spawn", () => {
    console.log("Next.js production server started.");
  });

  nextServer.on("exit", (code) => {
    console.log(`Next.js production server exited with code ${code}.`);
    nextServer = null;
  });
}

async function waitForServer(
  url: string,
  retries = 50,
  delay = 200,
): Promise<void> {
  for (let attempt = 0; attempt < retries; attempt += 1) {
    try {
      const response = await fetch(url);

      if (response.ok || response.status < 500) {
        return;
      }
    } catch {
      // Server is not ready yet.
    }

    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  throw new Error(`Next.js server did not start at ${url}`);
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.once("ready-to-show", () => {
    mainWindow?.show();
  });

  if (isProduction) {
    startNextServer();

    await waitForServer(`http://${HOST}:${PORT}`);

    await mainWindow.loadURL(`http://${HOST}:${PORT}`);
  } else {
    await mainWindow.loadURL("http://localhost:3000");
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

function registerDatabaseHandlers(): void {
  ipcMain.handle("db:load-state", () => {
    const database = getDatabase();

    const row = database
      .prepare(
        `
          SELECT data
          FROM app_state
          WHERE id = 1
        `,
      )
      .get() as { data: string } | undefined;

    if (!row) {
      return null;
    }

    return JSON.parse(row.data);
  });

  ipcMain.handle(
    "db:save-state",
    (_event, state: unknown) => {
      const database = getDatabase();

      const data = JSON.stringify(state);
      const updatedAt = new Date().toISOString();

      database
        .prepare(
          `
            INSERT INTO app_state (
              id,
              data,
              updated_at
            )
            VALUES (1, ?, ?)
            ON CONFLICT(id)
            DO UPDATE SET
              data = excluded.data,
              updated_at = excluded.updated_at
          `,
        )
        .run(data, updatedAt);
    },
  );

  ipcMain.handle("db:get-session", () => {
    const database = getDatabase();

    const row = database
      .prepare(
        `
          SELECT user_id
          FROM session
          WHERE id = 1
        `,
      )
      .get() as { user_id: string | null } | undefined;

    return row?.user_id ?? null;
  });

  ipcMain.handle(
    "db:set-session",
    (_event, userId: string) => {
      const database = getDatabase();

      database
        .prepare(
          `
            INSERT INTO session (
              id,
              user_id,
              updated_at
            )
            VALUES (1, ?, ?)
            ON CONFLICT(id)
            DO UPDATE SET
              user_id = excluded.user_id,
              updated_at = excluded.updated_at
          `,
        )
        .run(userId, new Date().toISOString());
    },
  );

  ipcMain.handle("db:clear-session", () => {
    const database = getDatabase();

    database
      .prepare(
        `
          DELETE FROM session
          WHERE id = 1
        `,
      )
      .run();
  });
}

function registerPrinterHandlers(): void {
  ipcMain.handle(
    "printer:print",
    async (_event, payload: { sale: Sale; business: Business }) => {
      await printReceipt(payload.sale, payload.business);
    },
  );
}

app.whenReady().then(async () => {
  registerDatabaseHandlers();
  registerPrinterHandlers();
  try {
    await createWindow();
  } catch (error) {
    console.error("Failed to start Bluebird POS:", error);
    app.quit();
    return;
  }

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      void createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (nextServer) {
    nextServer.kill();
    nextServer = null;
  }

  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", () => {
  if (nextServer) {
    nextServer.kill();
    nextServer = null;
  }

  closeDatabase();
});
