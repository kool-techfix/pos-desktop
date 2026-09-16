import {
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

const users: User[] = [
  {
    id: "admin-1",
    name: "Mara Ellis",
    username: "owner@bluebird.test",
    password: "bluebird",
    role: "ADMIN",
    active: true,
  },
  {
    id: "admin-2",
    name: "Inactive Admin",
    username: "inactive@bluebird.test",
    password: "password",
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
  beforeEach(() => {
    logout();
  });

  it("logs in an admin with valid credentials", () => {
    const result = loginAsAdmin(users, {
      username: "owner@bluebird.test",
      password: "bluebird",
    });

    expect(result.user.id).toBe("admin-1");
    expect(result.user.role).toBe("ADMIN");
  });

  it("allows admin username matching regardless of case", () => {
    const result = loginAsAdmin(users, {
      username: "OWNER@BLUEBIRD.TEST",
      password: "bluebird",
    });

    expect(result.user.id).toBe("admin-1");
  });

  it("rejects an invalid admin password", () => {
    expect(() =>
      loginAsAdmin(users, {
        username: "owner@bluebird.test",
        password: "wrong-password",
      }),
    ).toThrow("Invalid username or password");
  });

  it("rejects an unknown admin username", () => {
    expect(() =>
      loginAsAdmin(users, {
        username: "unknown@bluebird.test",
        password: "bluebird",
      }),
    ).toThrow("Invalid username or password");
  });

  it("rejects an inactive admin", () => {
    expect(() =>
      loginAsAdmin(users, {
        username: "inactive@bluebird.test",
        password: "password",
      }),
    ).toThrow("This account is inactive");
  });

  it("logs in a sales person with a valid sign-in code", () => {
    const result = loginAsSalesPerson(users, {
      signInCode: "JB4826",
    });

    expect(result.user.id).toBe("sp-1");
    expect(result.user.role).toBe("SALES_PERSON");
  });

  it("allows sales-person sign-in code matching regardless of case", () => {
    const result = loginAsSalesPerson(users, {
      signInCode: "jb4826",
    });

    expect(result.user.id).toBe("sp-1");
  });

  it("rejects an invalid sales-person sign-in code", () => {
    expect(() =>
      loginAsSalesPerson(users, {
        signInCode: "WRONG1",
      }),
    ).toThrow("Invalid sign-in code");
  });

  it("rejects an inactive sales person", () => {
    expect(() =>
      loginAsSalesPerson(users, {
        signInCode: "IS1234",
      }),
    ).toThrow("This account is inactive");
  });

  it("returns the currently authenticated user", () => {
    loginAsAdmin(users, {
      username: "owner@bluebird.test",
      password: "bluebird",
    });

    const user = getCurrentUser(users);

    expect(user?.id).toBe("admin-1");
  });

  it("reports an authenticated session", () => {
    loginAsSalesPerson(users, {
      signInCode: "JB4826",
    });

    expect(isAuthenticated(users)).toBe(true);
  });

  it("reports no authenticated session before login", () => {
    expect(isAuthenticated(users)).toBe(false);
  });

  it("logs out the current user", () => {
    loginAsAdmin(users, {
      username: "owner@bluebird.test",
      password: "bluebird",
    });

    logout();

    expect(getCurrentUser(users)).toBeUndefined();
    expect(isAuthenticated(users)).toBe(false);
  });

  it("clears the session when the session user no longer exists", () => {
    loginAsAdmin(users, {
      username: "owner@bluebird.test",
      password: "bluebird",
    });

    const usersWithoutAdmin = users.filter(
      (user) => user.id !== "admin-1",
    );

    expect(getCurrentUser(usersWithoutAdmin)).toBeUndefined();
    expect(isAuthenticated(usersWithoutAdmin)).toBe(false);
  });

  it("requires admin username and password", () => {
    expect(() =>
      loginAsAdmin(users, {
        username: "",
        password: "",
      }),
    ).toThrow("Username and password are required");
  });

  it("requires a sales-person sign-in code", () => {
    expect(() =>
      loginAsSalesPerson(users, {
        signInCode: "",
      }),
    ).toThrow("Sign-in code is required");
  });
});