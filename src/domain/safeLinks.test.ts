import { describe, expect, it } from "vitest";
import { isSafeBookHref } from "./safeLinks";

describe("Book links", () => {
  it("allows internal anchors and secure external links", () => {
    expect(isSafeBookHref("#note")).toBe(true);
    expect(isSafeBookHref(" https://example.com ")).toBe(true);
  });

  it("rejects unsafe or unsupported link targets", () => {
    expect(isSafeBookHref("javascript:alert(1)")).toBe(false);
    expect(isSafeBookHref("http://example.com")).toBe(false);
    expect(isSafeBookHref("mailto:test@example.com")).toBe(false);
  });
});
