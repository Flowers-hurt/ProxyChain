import type { ProxyNode } from "./types";
import type { ResidentialProxy } from "./residential";

export interface ChainNode {
  name: string;
  config: Record<string, unknown>;
  nodeId: string;
  residentialId: string;
}

export const DEFAULT_GROUP_NAME = "🛡️ 住宅链式代理";

function uniqueName(base: string, taken: Set<string>): string {
  let name = base;
  let n = 2;
  while (taken.has(name)) {
    name = `${base} (${n})`;
    n += 1;
  }
  taken.add(name);
  return name;
}

// Cartesian product: every selected airport node × every residential proxy.
// Each chain node is a copy of the residential proxy dialing out through the
// airport node via Clash Meta's dialer-proxy.
export function generateChains(
  nodes: ProxyNode[],
  residentials: ResidentialProxy[],
  existingNames: string[],
): ChainNode[] {
  const taken = new Set(existingNames);
  const chains: ChainNode[] = [];

  for (const node of nodes) {
    for (const resi of residentials) {
      const name = uniqueName(`Chain | ${node.name} → ${resi.name}`, taken);
      const config: Record<string, unknown> = {
        ...resi.extra,
        name,
        type: resi.type,
        server: resi.server,
        port: resi.port,
        "dialer-proxy": node.name,
      };
      if (resi.username !== undefined) config.username = resi.username;
      if (resi.password !== undefined) config.password = resi.password;
      chains.push({ name, config, nodeId: node.id, residentialId: resi.id });
    }
  }

  return chains;
}

export function buildProxyGroup(
  name: string,
  chainNames: string[],
): Record<string, unknown> {
  return { name, type: "select", proxies: chainNames };
}
