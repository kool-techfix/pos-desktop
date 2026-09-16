import { describe, expect, it } from "vitest";
import type { Business } from "@/types/types";
import {
  getBusiness,
  updateBusiness,
} from "./business";

const business: Business = {
  name: "Bluebird Drinks",
};

describe("business", () => {
  it("gets the business", () => {
    const result = getBusiness(business);

    expect(result).toEqual({
      name: "Bluebird Drinks",
    });
  });

  it("updates the business name", () => {
    const result = updateBusiness(business, {
      name: "Bluebird Beverages",
    });

    expect(result.name).toBe("Bluebird Beverages");
  });

  it("trims the business name", () => {
    const result = updateBusiness(business, {
      name: "  Bluebird Beverages  ",
    });

    expect(result.name).toBe("Bluebird Beverages");
  });

  it("rejects an empty business name", () => {
    expect(() =>
      updateBusiness(business, {
        name: "",
      }),
    ).toThrow("Business name is required");
  });

  it("rejects a whitespace-only business name", () => {
    expect(() =>
      updateBusiness(business, {
        name: "   ",
      }),
    ).toThrow("Business name is required");
  });

  it("does not mutate the original business", () => {
    const result = updateBusiness(business, {
      name: "New Business",
    });

    expect(result).not.toBe(business);
    expect(business.name).toBe("Bluebird Drinks");
  });

  it("preserves existing values when no update is provided", () => {
    const result = updateBusiness(business, {});

    expect(result).toEqual(business);
  });
});