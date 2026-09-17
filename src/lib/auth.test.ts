import {
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import type { User } from "@/types/types";
import {
  getCurrentUser,
  isAuthenticated,
  loginAsAdmin,
  loginAsSalesPerson,
  logout,
} from "./auth";
import { hashPassword } from "./password";

const users: User[] = [
  {
    id: "admin-1",
    name: "Mara Ellis",
    username: "owner@bluebird.test",
    password: "",
    role: "ADMIN",
    active: true,
  },
  {
    id: "admin-2",
    name: "Inactive Admin",
    username: "inactive@bluebird.test",
    password: "",
    role: "ADMIN",
    active: false,
  },
  {
    id: "sp-1",
    name: "Jon Bell",
    role: "SALES_PERSON",
    signInCode: "JB4826",
    active: true,
  },
  {
    id: "sp-2",
    name: "Inactive Sales Person",
    role: "SALES_PERSON",
    signInCode: "IS1234",
    active: false,
  },
];

beforeAll(async () => {
  users[0].password = await hashPassword("bluebird");
  users[1].password = await hashPassword("password");
});

const localStorageMock = {
  store: new Map<string, string>(),

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  },

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  },

  removeItem(key: string): void {
    this.store.delete(key);
  },

  clear(): void {
    this.store.clear();
  },
};

vi.stubGlobal("window", {
  localStorage: localStorageMock,
});

describe("auth", () => {
  beforeEach(async () => {
    await logout();
  });

  it("logs in an admin with valid credentials", async () => {
    const result = await loginAsAdmin(users, {
      username: "owner@bluebird.test",
      password: "bluebird",
    });

    expect(result.user.id).toBe("admin-1");
    expect(result.user.role).toBe("ADMIN");
  });

  it("allows admin username matching regardless of case", async () => {
    const result = await loginAsAdmin(users, {
      username: "OWNER@BLUEBIRD.TEST",
      password: "bluebird",
    });

    expect(result.user.id).toBe("admin-1");
  });

  it("rejects an invalid admin password", async () => {
    await expect(
      loginAsAdmin(users, {
        username: "owner@bluebird.test",
        password: "wrong-password",
      }),
    ).rejects.toThrow("Invalid username or password");
  });

  it("rejects an unknown admin username", async () => {
    await expect(
      loginAsAdmin(users, {
        username: "unknown@bluebird.test",
        password: "bluebird",
      }),
    ).rejects.toThrow("Invalid username or password");
  });

  it("rejects an inactive admin", async () => {
    await expect(
      loginAsAdmin(users, {
        username: "inactive@bluebird.test",
        password: "password",
      }),
    ).rejects.toThrow("This account is inactive");
  });

  it("logs in a sales person with a valid sign-in code", async () => {
    const result = await loginAsSalesPerson(users, {
      signInCode: "JB4826",
    });

    expect(result.user.id).toBe("sp-1");
    expect(result.user.role).toBe("SALES_PERSON");
  });

  it("allows sales-person sign-in code matching regardless of case", async () => {
    const result = await loginAsSalesPerson(users, {
      signInCode: "jb4826",
    });

    expect(result.user.id).toBe("sp-1");
  });

  it("rejects an invalid sales-person sign-in code", async () => {
    await expect(
      loginAsSalesPerson(users, {
        signInCode: "WRONG1",
      }),
    ).rejects.toThrow("Invalid sign-in code");
  });

  it("rejects an inactive sales person", async () => {
    await expect(
      loginAsSalesPerson(users, {
        signInCode: "IS1234",
      }),
    ).rejects.toThrow("This account is inactive");
  });

  it("returns the currently authenticated user", async () => {
    await loginAsAdmin(users, {
      username: "owner@bluebird.test",
      password: "bluebird",
    });

    const user = await getCurrentUser(users);

    expect(user?.id).toBe("admin-1");
  });

  it("reports an authenticated session", async () => {
    await loginAsSalesPerson(users, {
      signInCode: "JB4826",
    });

    expect(await isAuthenticated(users)).toBe(true);
  });

  it("reports no authenticated session before login", async () => {
    expect(await isAuthenticated(users)).toBe(false);
  });

  it("logs out the current user", async () => {
    await loginAsAdmin(users, {
      username: "owner@bluebird.test",
      password: "bluebird",
    });

    await logout();

    expect(await getCurrentUser(users)).toBeUndefined();
    expect(await isAuthenticated(users)).toBe(false);
  });

  it("clears the session when the session user no longer exists", async () => {
    await loginAsAdmin(users, {
      username: "owner@bluebird.test",
      password: "bluebird",
    });

    const usersWithoutAdmin = users.filter(
      (user) => user.id !== "admin-1",
    );

    expect(await getCurrentUser(usersWithoutAdmin)).toBeUndefined();
    expect(await isAuthenticated(usersWithoutAdmin)).toBe(false);
  });

  it("requires admin username and password", async () => {
    await expect(
      loginAsAdmin(users, {
        username: "",
        password: "",
      }),
    ).rejects.toThrow("Username and password are required");
  });

  it("requires a sales-person sign-in code", async () => {
    await expect(
      loginAsSalesPerson(users, {
        signInCode: "",
      }),
    ).rejects.toThrow("Sign-in code is required");
  });
});