import type { Business } from "@/types/types";

export type BusinessUpdate = Partial<Business>;

export function createBusiness(name: string): Business {
  const trimmedName = name.trim();

  if (!trimmedName) {
    throw new Error("Business name is required");
  }

  return {
    name: trimmedName,
  };
}

export function getBusiness(business: Business): Business {
  return business;
}

export function updateBusiness(
  business: Business,
  updates: BusinessUpdate,
): Business {
  const name =
    updates.name !== undefined
      ? updates.name.trim()
      : business.name;

  if (!name) {
    throw new Error("Business name is required");
  }

  return {
    ...business,
    ...updates,
    name,
  };
}