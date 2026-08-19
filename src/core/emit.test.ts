import { describe, expect, it } from "vitest";
import { parseInput } from "./parser";
import { generateChains } from "./chain";
import { emit } from "./emit";
import { parse } from "yaml";
import type { ResidentialProxy } from "./residential";

const FULL = `# kept comment
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

tun:
  enable: false

sniffer:
  enable: true

custom-unknown-field:
  keep: me
`;

const RESI: ResidentialProxy = {
  id: "r-1",
  name: "US-Resi-1",
  type: "socks5",
  server: "10.0.0.1",
  port: 1080,
  username: "u",
  password: "p",
  extra: {},
};

function setup(input: string) {
  const result = parseInput(input);
  if (!result.ok) throw new Error("parse failed");
  const config = result.config;
  const chains = generateChains(
    config.proxies,
    [RESI],
    config.proxies.map((p) => p.name),
  );
  return { config, chains };
}

describe("emit FULL with full config input", () => {
  it("appends chains and group while preserving everything else verbatim", () => {
    const { config, chains } = setup(FULL);
    const out = emit({ mode: "FULL", chains, group: { name: "🛡️ 住宅链式代理" }, config });

    expect(out).toContain("# kept comment");
    expect(out).toContain("custom-unknown-field");
    expect(out).toContain("sniffer");

    const parsed = parse(out);
    expect(parsed["mixed-port"]).toBe(7890);
    expect(parsed.proxies).toHaveLength(2);
    expect(parsed.proxies[1]["dialer-proxy"]).toBe("HK-01");
    expect(parsed["proxy-groups"]).toHaveLength(2);
    expect(parsed["proxy-groups"][1]).toEqual({
      name: "🛡️ 住宅链式代理",
      type: "select",
      proxies: ["Chain | HK-01 → US-Resi-1"],
    });
    expect(parsed.rules).toEqual(["MATCH,🚀 节点选择"]);
    expect(parsed.dns).toEqual({ enable: true });
    expect(parsed.tun).toEqual({ enable: false });
  });

  it("does not touch proxy-groups when no group requested", () => {
    const { config, chains } = setup(FULL);
    const parsed = parse(emit({ mode: "FULL", chains, group: null, config }));
    expect(parsed["proxy-groups"]).toHaveLength(1);
  });
});

describe("emit FULL with partial input", () => {
  it("keeps original proxies plus chains, never fabricating other fields", () => {
    const { config, chains } = setup("proxies:\n  - name: HK\n    type: ss\n    server: e.com\n    port: 443\n");
    const parsed = parse(emit({ mode: "FULL", chains, group: { name: "G" }, config }));
    expect(Object.keys(parsed).sort()).toEqual(["proxies", "proxy-groups"]);
    expect(parsed.proxies).toHaveLength(2);
    expect(parsed.proxies[0].name).toBe("HK");
    expect(parsed["mixed-port"]).toBeUndefined();
    expect(parsed.rules).toBeUndefined();
    expect(parsed.dns).toBeUndefined();
  });

  it("emits only proxies when no group requested for a proxy list", () => {
    const { config, chains } = setup("- {name: HK, type: ss, server: e.com, port: 443}\n");
    const parsed = parse(emit({ mode: "FULL", chains, group: null, config }));
    expect(Object.keys(parsed)).toEqual(["proxies"]);
    expect(parsed.proxies).toHaveLength(2);
  });
});

describe("emit reduced modes", () => {
  it("PROXIES_ONLY emits only the generated chain nodes", () => {
    const { config, chains } = setup(FULL);
    const parsed = parse(emit({ mode: "PROXIES_ONLY", chains, group: null, config }));
    expect(Object.keys(parsed)).toEqual(["proxies"]);
    expect(parsed.proxies).toHaveLength(1);
    expect(parsed.proxies[0]["dialer-proxy"]).toBe("HK-01");
  });

  it("PROXIES_AND_GROUPS emits chains plus the group", () => {
    const { config, chains } = setup(FULL);
    const parsed = parse(
      emit({ mode: "PROXIES_AND_GROUPS", chains, group: { name: "G" }, config }),
    );
    expect(Object.keys(parsed).sort()).toEqual(["proxies", "proxy-groups"]);
    expect(parsed["proxy-groups"][0].proxies).toEqual(["Chain | HK-01 → US-Resi-1"]);
  });
});
