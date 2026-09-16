import type { User } from "@/types/types";
import {
  clearSession,
  getSessionId,
  setSessionId,
} from "./storage";
import { getSalesPersonByCode } from "./salesPerson";

export type AdminLoginInput = {
  username: string;
  password: string;
};

export type SalesPersonLoginInput = {
  signInCode: string;
};

export type AdminRegistrationInput = {
  name: string;
  username: string;
  password: string;
};

export type LoginResult = {
  user: User;
};

export function loginAsAdmin(
  users: User[],
  input: AdminLoginInput,
): LoginResult {
  const username = input.username.trim().toLowerCase();

  if (!username || !input.password) {
    throw new Error("Username and password are required");
  }

  const user = users.find(
    (candidate) =>
      candidate.role === "ADMIN" &&
      candidate.username?.trim().toLowerCase() === username,
  );

  if (!user || user.password !== input.password) {
    throw new Error("Invalid username or password");
  }

  if (!user.active) {
    throw new Error("This account is inactive");
  }

  setSessionId(user.id);

  return {
    user,
  };
}

export function loginAsSalesPerson(
  users: User[],
  input: SalesPersonLoginInput,
): LoginResult {
  const signInCode = input.signInCode.trim();

  if (!signInCode) {
    throw new Error("Sign-in code is required");
  }

  const user = getSalesPersonByCode(users, signInCode);

  if (!user) {
    throw new Error("Invalid sign-in code");
  }

  if (!user.active) {
    throw new Error("This account is inactive");
  }

  setSessionId(user.id);

  return {
    user,
  };
}

export function registerAdmin(
  users: User[],
  input: AdminRegistrationInput,
): User[] {
  const name = input.name.trim();
  const username = input.username.trim();
  const password = input.password;

  if (!name) {
    throw new Error("Admin name is required");
  }

  if (!username) {
    throw new Error("Admin username is required");
  }

  if (password.length < 4) {
    throw new Error("Password must be at least 4 characters");
  }

  const normalizedUsername = username.toLowerCase();

  const existingUser = users.find(
    (user) =>
      user.role === "ADMIN" &&
      user.username?.trim().toLowerCase() === normalizedUsername,
  );

  if (existingUser) {
    throw new Error("An admin account with this username already exists");
  }

  const admin: User = {
    id: crypto.randomUUID(),
    name,
    username,
    password,
    role: "ADMIN",
    active: true,
  };

  return [
    ...users.filter((user) => user.role !== "ADMIN"),
    admin,
  ];
}

export function getCurrentUser(
  users: User[],
): User | undefined {
  const sessionId = getSessionId();

  if (!sessionId) {
    return undefined;
  }

  const user = users.find(
    (candidate) => candidate.id === sessionId,
  );

  if (!user || !user.active) {
    clearSession();
    return undefined;
  }

  return user;
}

export function isAuthenticated(users: User[]): boolean {
  return getCurrentUser(users) !== undefined;
}

export function logout(): void {
  clearSession();
}