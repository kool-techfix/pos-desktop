import { describe, expect, it } from "vitest";

import { hashPassword, verifyPassword } from "./password";

describe("password", () => {
  it("verifies a password against its own hash", async () => {
    const hash = await hashPassword("correct horse battery staple");

    expect(await verifyPassword("correct horse battery staple", hash)).toBe(
      true,
    );
  });

  it("rejects an incorrect password", async () => {
    const hash = await hashPassword("correct horse battery staple");

    expect(await verifyPassword("wrong password", hash)).toBe(false);
  });

  it("does not store the password in plaintext", async () => {
    const hash = await hashPassword("bluebird");

    expect(hash).not.toContain("bluebird");
  });

  it("produces a different hash each time due to random salt", async () => {
    const first = await hashPassword("bluebird");
    const second = await hashPassword("bluebird");

    expect(first).not.toBe(second);
    expect(await verifyPassword("bluebird", first)).toBe(true);
    expect(await verifyPassword("bluebird", second)).toBe(true);
  });

  it("rejects a malformed stored hash", async () => {
    expect(await verifyPassword("bluebird", "not-a-valid-hash")).toBe(false);
  });
});
