import { describe, expect, it } from "vitest";
import { buildProxyGroup, generateChains } from "./chain";
import type { ProxyNode } from "./types";
import type { ResidentialProxy } from "./residential";

function node(name: string): ProxyNode {
  return {
    id: `n-${name}`,
    name,
    type: "ss",
    server: "airport.example.com",
    port: 443,
    raw: { name, type: "ss", server: "airport.example.com", port: 443 },
  };
}

function resi(name: string): ResidentialProxy {
  return {
    id: `r-${name}`,
    name,
    type: "socks5",
    server: "10.0.0.1",
    port: 1080,
    username: "u",
    password: "p",
    extra: {},
  };
}

describe("generateChains", () => {
  it("produces the cartesian product", () => {
    const chains = generateChains([node("HK"), node("US"), node("JP")], [resi("R1"), resi("R2")], []);
    expect(chains).toHaveLength(6);
  });

  it("copies residential fields and points dialer-proxy at the airport node", () => {
    const [chain] = generateChains([node("香港07")], [resi("US-Resi-1")], []);
    expect(chain.name).toBe("Chain | 香港07 → US-Resi-1");
    expect(chain.config).toMatchObject({
      name: "Chain | 香港07 → US-Resi-1",
      type: "socks5",
      server: "10.0.0.1",
      port: 1080,
      username: "u",
      password: "p",
      "dialer-proxy": "香港07",
    });
    expect(chain.nodeId).toBe("n-香港07");
    expect(chain.residentialId).toBe("r-US-Resi-1");
  });

  it("omits undefined credentials from the config", () => {
    const bare: ResidentialProxy = { ...resi("R"), username: undefined, password: undefined };
    const [chain] = generateChains([node("HK")], [bare], []);
    expect("username" in chain.config).toBe(false);
    expect("password" in chain.config).toBe(false);
  });

  it("dedupes names against existing proxies", () => {
    const chains = generateChains([node("HK")], [resi("R1")], ["Chain | HK → R1"]);
    expect(chains[0].name).toBe("Chain | HK → R1 (2)");
    expect(chains[0].config.name).toBe("Chain | HK → R1 (2)");
  });

  it("merges residential extra fields", () => {
    const withExtra: ResidentialProxy = { ...resi("R"), extra: { udp: true } };
    const [chain] = generateChains([node("HK")], [withExtra], []);
    expect(chain.config.udp).toBe(true);
  });
});

describe("buildProxyGroup", () => {
  it("builds a select group with the chain names", () => {
    const group = buildProxyGroup("🛡️ 住宅链式代理", ["a", "b"]);
    expect(group).toEqual({ name: "🛡️ 住宅链式代理", type: "select", proxies: ["a", "b"] });
  });
});
