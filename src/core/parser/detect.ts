import type { InputType } from "../types";

// Clash top-level keys other than `proxies` that mark a document as a full config.
const CLASH_TOP_LEVEL_KEYS = new Set([
  "port",
  "socks-port",
  "redir-port",
  "tproxy-port",
  "mixed-port",
  "mode",
  "log-level",
  "allow-lan",
  "bind-address",
  "ipv6",
  "external-controller",
  "external-ui",
  "secret",
  "interface-name",
  "routing-mark",
  "unified-delay",
  "tcp-concurrent",
  "global-client-fingerprint",
  "profile",
  "proxy-groups",
  "proxy-providers",
  "rule-providers",
  "rules",
  "sub-rules",
  "dns",
  "tun",
  "sniffer",
  "hosts",
  "geodata-mode",
  "geox-url",
  "listeners",
  "tunnels",
  "experimental",
  "ntp",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function looksLikeProxy(value: unknown): boolean {
  if (!isRecord(value)) return false;
  const hasNameAndType =
    typeof value.name === "string" && typeof value.type === "string";
  const hasServerAndPort = value.server !== undefined && value.port !== undefined;
  return hasNameAndType || hasServerAndPort;
}

export function detectInputType(value: unknown): InputType {
  if (Array.isArray(value)) {
    return value.length > 0 && value.every(looksLikeProxy) ? "PROXY_LIST" : "UNKNOWN";
  }

  if (isRecord(value)) {
    // A single proxy mapping shares keys with a full config (e.g. `port`),
    // so proxy-likeness wins when the object itself is a proxy.
    if (looksLikeProxy(value)) return "SINGLE_PROXY";
    const keys = Object.keys(value);
    if (keys.some((k) => CLASH_TOP_LEVEL_KEYS.has(k))) return "FULL_CONFIG";
    if (Array.isArray(value.proxies)) return "PROXIES_SECTION";
  }

  return "UNKNOWN";
}
