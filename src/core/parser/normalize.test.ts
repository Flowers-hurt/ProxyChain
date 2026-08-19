import { describe, expect, it } from "vitest";
import { parseInput } from "./index";

const FULL = `
# my config
mixed-port: 7890
allow-lan: true
mode: rule

proxies:
  - name: "HK-01"
    type: ss
    server: example.com
    port: 443
    cipher: chacha20-ietf-poly1305
    password: xxx

proxy-groups:
  - name: "🚀 节点选择"
    type: select
    proxies:
      - "HK-01"
      - DIRECT

rules:
  - MATCH,🚀 节点选择

dns:
  enable: true

sniffer:
  enable: true
`;

describe("parseInput", () => {
  it("normalizes a full config with counts and preserved document", () => {
    const result = parseInput(FULL);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const c = result.config;
    expect(c.inputType).toBe("FULL_CONFIG");
    expect(c.proxies).toHaveLength(1);
    expect(c.proxies[0].name).toBe("HK-01");
    expect(c.proxyGroups).toHaveLength(1);
    expect(c.ruleCount).toBe(1);
    expect(c.otherKeys).toEqual(
      expect.arrayContaining(["mixed-port", "allow-lan", "mode", "dns", "sniffer"]),
    );
    expect(c.originalDocument).toBeDefined();
  });

  it("auto-completes the model for a proxies-only section", () => {
    const result = parseInput(
      "proxies:\n  - name: HK\n    type: ss\n    server: e.com\n    port: 443\n    cipher: c\n    password: x\n",
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.config.inputType).toBe("PROXIES_SECTION");
    expect(result.config.proxies).toHaveLength(1);
    expect(result.config.proxyGroups).toEqual([]);
    expect(result.config.ruleCount).toBe(0);
  });

  it("keeps every raw field for unknown proxy types", () => {
    const result = parseInput(
      '- {name: 香港07, server: a.com, port: 14527, type: anytls, password: "p", sni: s.com, skip-cert-verify: true, udp: true, tfo: false}\n',
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const node = result.config.proxies[0];
    expect(node.type).toBe("anytls");
    expect(node.server).toBe("a.com");
    expect(node.port).toBe(14527);
    expect(node.raw["skip-cert-verify"]).toBe(true);
    expect(node.raw.sni).toBe("s.com");
    expect(node.raw.tfo).toBe(false);
  });

  it("wraps a single proxy into a one-node list", () => {
    const result = parseInput("name: HK\ntype: ss\nserver: e.com\nport: 443\n");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.config.inputType).toBe("SINGLE_PROXY");
    expect(result.config.proxies).toHaveLength(1);
  });

  it("returns UNKNOWN config instead of rejecting odd-but-valid YAML", () => {
    const result = parseInput("hello: world\n");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.config.inputType).toBe("UNKNOWN");
    expect(result.config.proxies).toEqual([]);
  });

  it("propagates syntax errors", () => {
    const result = parseInput("a:\n  - b\n bad: [\n");
    expect(result.ok).toBe(false);
  });

  it("skips malformed entries inside proxies without failing", () => {
    const result = parseInput("proxies:\n  - name: ok\n    type: ss\n  - just-a-string\n");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.config.proxies).toHaveLength(1);
  });

  it("assigns stable unique ids", () => {
    const result = parseInput("- {name: A, type: ss}\n- {name: A, type: ss}\n");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const ids = result.config.proxies.map((p) => p.id);
    expect(new Set(ids).size).toBe(2);
  });
});
