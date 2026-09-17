import { describe, expect, it } from "vitest";

import type { User } from "@/types/types";

import {
  addSalesPerson,
  deleteSalesPerson,
  getSalesPersonByCode,
  getSalesPersonById,
  getSalesPersons,
  setSalesPersonActive,
  updateSalesPerson,
} from "./salesPerson";

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
    id: "sp-1",
    name: "Jon Bell",
    role: "SALES_PERSON",
    signInCode: "JB4826",
    active: true,
  },
  {
    id: "sp-2",
    name: "Sarah Cole",
    role: "SALES_PERSON",
    signInCode: "SC1934",
    active: true,
  },
];

describe("salesPersons", () => {
  it("gets only sales persons", () => {
    const result = getSalesPersons(users);

    expect(result).toHaveLength(2);
    expect(
      result.every((user) => user.role === "SALES_PERSON"),
    ).toBe(true);
  });

  it("gets a sales person by id", () => {
    const result = getSalesPersonById(users, "sp-1");

    expect(result?.name).toBe("Jon Bell");
  });

  it("returns undefined for an unknown sales person", () => {
    const result = getSalesPersonById(users, "unknown");

    expect(result).toBeUndefined();
  });

  it("finds a sales person by sign-in code", () => {
    const result = getSalesPersonByCode(users, "JB4826");

    expect(result?.id).toBe("sp-1");
  });

  it("finds sign-in codes case-insensitively", () => {
    const result = getSalesPersonByCode(users, "jb4826");

    expect(result?.id).toBe("sp-1");
  });

  it("adds a sales person and generates a six-character code", () => {
    const result = addSalesPerson(users, {
      name: "David Stone",
    });

    expect(result).toHaveLength(4);

    const salesPerson = result.find(
      (user) => user.name === "David Stone",
    );

    expect(salesPerson).toMatchObject({
      name: "David Stone",
      role: "SALES_PERSON",
      active: true,
    });

    expect(salesPerson?.signInCode).toMatch(/^DS\d{4}$/);
  });

  it("generates the correct initials for a single name", () => {
    const result = addSalesPerson(users, {
      name: "Yusuf",
    });

    const salesPerson = result.find(
      (user) => user.name === "Yusuf",
    );

    expect(salesPerson?.signInCode).toMatch(/^YU\d{4}$/);
    expect(salesPerson?.signInCode).toHaveLength(6);
  });

  it("generates the correct initials for a full name", () => {
    const result = addSalesPerson(users, {
      name: "Yusuf Mukhtar",
    });

    const salesPerson = result.find(
      (user) => user.name === "Yusuf Mukhtar",
    );

    expect(salesPerson?.signInCode).toMatch(/^YM\d{4}$/);
    expect(salesPerson?.signInCode).toHaveLength(6);
  });

  it("trims the sales person's name", () => {
    const result = addSalesPerson(users, {
      name: "  Yusuf Mukhtar  ",
    });

    const salesPerson = result.find(
      (user) => user.id !== "admin-1" && user.id !== "sp-1" && user.id !== "sp-2",
    );

    expect(salesPerson?.name).toBe("Yusuf Mukhtar");
    expect(salesPerson?.signInCode).toMatch(/^YM\d{4}$/);
  });

  it("rejects an empty sales person name", () => {
    expect(() =>
      addSalesPerson(users, {
        name: "   ",
      }),
    ).toThrow("Sales person name is required");
  });

  it("updates a sales person", () => {
    const result = updateSalesPerson(users, "sp-1", {
      name: "Jonathan Bell"
    });

    const salesPerson = result.find(
      (user) => user.id === "sp-1",
    );

    expect(salesPerson?.name).toBe("Jonathan Bell");
    expect(salesPerson?.signInCode).toBe("JB4826");
  });

  it("does not mutate the original users array", () => {
    const result = updateSalesPerson(users, "sp-1", {
      name: "Updated Name",
    });

    expect(result).not.toBe(users);
    expect(users[1].name).toBe("Jon Bell");
  });

  it("deactivates a sales person", () => {
    const result = setSalesPersonActive(
      users,
      "sp-1",
      false,
    );

    expect(
      result.find((user) => user.id === "sp-1")?.active,
    ).toBe(false);
  });

  it("reactivates a sales person", () => {
    const inactiveUsers = users.map((user) =>
      user.id === "sp-1"
        ? { ...user, active: false }
        : user,
    );

    const result = setSalesPersonActive(
      inactiveUsers,
      "sp-1",
      true,
    );

    expect(
      result.find((user) => user.id === "sp-1")?.active,
    ).toBe(true);
  });

  it("deletes a sales person", () => {
    const result = deleteSalesPerson(users, "sp-2");

    expect(result).toHaveLength(2);

    expect(
      result.some((user) => user.id === "sp-2"),
    ).toBe(false);
  });

  it("rejects updating an unknown sales person", () => {
    expect(() =>
      updateSalesPerson(users, "unknown", {
        name: "Someone",
      }),
    ).toThrow("Sales person not found");
  });
});