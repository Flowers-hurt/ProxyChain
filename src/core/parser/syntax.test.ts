import { describe, expect, it } from "vitest";
import { parseSyntax } from "./syntax";

describe("parseSyntax", () => {
  it("parses valid YAML into a value and document", () => {
    const result = parseSyntax("proxies:\n  - name: HK\n    type: ss\n");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual({ proxies: [{ name: "HK", type: "ss" }] });
      expect(result.document).toBeDefined();
    }
  });

  it("parses flow-style inline proxy lines", () => {
    const result = parseSyntax(
      '- {name: 🇭🇰 高级 专线 香港 07, server: example.com, port: 14527, type: anytls, password: "xxx", skip-cert-verify: true}\n',
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      const arr = result.value as Record<string, unknown>[];
      expect(arr).toHaveLength(1);
      expect(arr[0].type).toBe("anytls");
      expect(arr[0]["skip-cert-verify"]).toBe(true);
    }
  });

  it("reports line and column for syntax errors", () => {
    const result = parseSyntax("proxies:\n  - name: HK\n   bad indent: [\n");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.line).toBeGreaterThan(0);
      expect(result.error.column).toBeGreaterThan(0);
      expect(result.error.message.length).toBeGreaterThan(0);
    }
  });

  it("rejects empty input with a message", () => {
    const result = parseSyntax("   \n  ");
    expect(result.ok).toBe(false);
  });
});
