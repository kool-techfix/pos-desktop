import { generateSalesPersonCode } from "@/helpers/helper";
import type { User } from "@/types/types";

export type SalesPersonInput = {
  name: string;
};

export type SalesPersonUpdate = Partial<SalesPersonInput>;

export function getSalesPersons(users: User[]): User[] {
  return users.filter((user) => user.role === "SALES_PERSON");
}

export function getSalesPersonById(
  users: User[],
  salesPersonId: string,
): User | undefined {
  return users.find(
    (user) =>
      user.id === salesPersonId &&
      user.role === "SALES_PERSON",
  );
}

export function getSalesPersonByCode(
  users: User[],
  signInCode: string,
): User | undefined {
  const normalizedCode = signInCode.trim().toLowerCase();

  if (!normalizedCode) {
    return undefined;
  }

  return users.find(
    (user) =>
      user.role === "SALES_PERSON" &&
      user.signInCode?.trim().toLowerCase() === normalizedCode,
  );
}

export function addSalesPerson(
  users: User[],
  input: SalesPersonInput,
): User[] {
  const name = input.name.trim();

  if (!name) {
    throw new Error("Sales person name is required");
  }

  const signInCode = generateSalesPersonCode(name);

  const existingSalesPerson = getSalesPersonByCode(
    users,
    signInCode,
  );

  if (existingSalesPerson) {
    throw new Error(
      "A sales person with this sign-in code already exists",
    );
  }

  const salesPerson: User = {
    id: crypto.randomUUID(),
    name,
    role: "SALES_PERSON",
    signInCode,
    active: true,
  };

  return [...users, salesPerson];
}

export function updateSalesPerson(
  users: User[],
  salesPersonId: string,
  updates: SalesPersonUpdate,
): User[] {
  const salesPerson = getSalesPersonById(users, salesPersonId);

  if (!salesPerson) {
    throw new Error("Sales person not found");
  }

  const nextName =
    updates.name !== undefined
      ? updates.name.trim()
      : salesPerson.name;

  if (!nextName) {
    throw new Error("Sales person name is required");
  }

  return users.map((user) =>
    user.id === salesPersonId
      ? {
          ...user,
          name: nextName,
        }
      : user,
  );
}

export function setSalesPersonActive(
  users: User[],
  salesPersonId: string,
  active: boolean,
): User[] {
  const salesPerson = getSalesPersonById(users, salesPersonId);

  if (!salesPerson) {
    throw new Error("Sales person not found");
  }

  return users.map((user) =>
    user.id === salesPersonId
      ? {
          ...user,
          active,
        }
      : user,
  );
}

export function deleteSalesPerson(
  users: User[],
  salesPersonId: string,
): User[] {
  const salesPerson = getSalesPersonById(users, salesPersonId);

  if (!salesPerson) {
    throw new Error("Sales person not found");
  }

  return users.filter((user) => user.id !== salesPersonId);
}