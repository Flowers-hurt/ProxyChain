import { parseInput } from "./parser";
import type { ProxyNode } from "./types";

export interface ResidentialProxy {
  id: string;
  name: string;
  type: string;
  server: string;
  port: number;
  username?: string;
  password?: string;
  extra: Record<string, unknown>;
}

export interface BatchParseResult {
  proxies: ResidentialProxy[];
  errors: { line: number; text: string }[];
}

let counter = 0;
export function nextResidentialId(): string {
  counter += 1;
  return `resi-${counter}`;
}

// One proxy per line: `host:port` or `host:port:user:pass`.
export function parseBatch(text: string, defaultType = "socks5"): BatchParseResult {
  const proxies: ResidentialProxy[] = [];
  const errors: { line: number; text: string }[] = [];

  text.split(/\r?\n/).forEach((rawLine, index) => {
    const line = rawLine.trim();
    if (line === "" || line.startsWith("#")) return;

    const parts = line.split(":");
    const port = Number(parts[1]);
    const valid =
      (parts.length === 2 || parts.length === 4) &&
      parts[0] !== "" &&
      Number.isInteger(port) &&
      port > 0 &&
      port < 65536;

    if (!valid) {
      errors.push({ line: index + 1, text: rawLine });
      return;
    }

    proxies.push({
      id: nextResidentialId(),
      name: `${parts[0]}:${parts[1]}`,
      type: defaultType,
      server: parts[0],
      port,
      username: parts[2],
      password: parts[3],
      extra: {},
    });
  });

  return { proxies, errors };
}

const RESERVED_KEYS = new Set([
  "name",
  "type",
  "server",
  "port",
  "username",
  "password",
]);

function residentialFromNode(
  node: ProxyNode,
  defaultType: string,
): ResidentialProxy | null {
  if (!node.server || node.port === undefined) return null;

  const extra: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(node.raw)) {
    if (!RESERVED_KEYS.has(key)) extra[key] = value;
  }

  const rawName = node.raw.name;
  return {
    id: nextResidentialId(),
    name:
      typeof rawName === "string" && rawName !== ""
        ? rawName
        : `${node.server}:${node.port}`,
    type: node.type && node.type !== "unknown" ? node.type : defaultType,
    server: node.server,
    port: node.port,
    username: typeof node.raw.username === "string" ? node.raw.username : undefined,
    password: typeof node.raw.password === "string" ? node.raw.password : undefined,
    extra,
  };
}

// Accepts either the `host:port[:user:pass]` line format or a YAML block
// (a proxies: section, a bare proxy list, or a single proxy mapping) so users
// can paste a residential exit exactly as their provider hands it over.
export function parseResidential(
  text: string,
  defaultType = "socks5",
): BatchParseResult {
  if (text.trim() === "") return { proxies: [], errors: [] };

  const parsed = parseInput(text);
  if (parsed.ok && parsed.config.proxies.length > 0) {
    const proxies: ResidentialProxy[] = [];
    const errors: { line: number; text: string }[] = [];
    parsed.config.proxies.forEach((node, index) => {
      const resi = residentialFromNode(node, defaultType);
      if (resi) proxies.push(resi);
      else errors.push({ line: index + 1, text: node.name });
    });
    return { proxies, errors };
  }

  return parseBatch(text, defaultType);
}
