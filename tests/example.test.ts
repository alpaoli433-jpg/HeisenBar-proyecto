import { describe, expect, it } from "vitest";

function add(a: number, b: number): number {
  return a + b;
}

describe("smoke test", () => {
  it("verifies the test runner is wired up correctly", () => {
    expect(add(2, 3)).toBe(5);
  });
});
