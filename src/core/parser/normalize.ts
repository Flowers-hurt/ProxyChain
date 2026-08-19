import type { Document } from "yaml";
import type { InputType, ProxyNode } from "../types";

export interface NormalizedConfig {
  format: "clash";
  inputType: InputType;
  proxies: ProxyNode[];
  proxyGroups: unknown[];
  ruleCount: number;
  otherKeys: string[];
  originalDocument?: Document;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toProxyNode(value: unknown, index: number): ProxyNode | null {
  if (!isRecord(value)) return null;
  const name =
    typeof value.name === "string" && value.name !== ""
      ? value.name
      : `Proxy ${index + 1}`;
  return {
    id: `proxy-${index}`,
    name,
    type: typeof value.type === "string" ? value.type : "unknown",
    server: typeof value.server === "string" ? value.server : undefined,
    port: typeof value.port === "number" ? value.port : undefined,
    raw: { ...value },
  };
}

function extractProxies(list: unknown): ProxyNode[] {
  if (!Array.isArray(list)) return [];
  return list
    .map((item, index) => toProxyNode(item, index))
    .filter((node): node is ProxyNode => node !== null);
}

export function normalize(
  value: unknown,
  inputType: InputType,
  document: Document,
): NormalizedConfig {
  const base: NormalizedConfig = {
    format: "clash",
    inputType,
    proxies: [],
    proxyGroups: [],
    ruleCount: 0,
    otherKeys: [],
  };

  switch (inputType) {
    case "FULL_CONFIG": {
      const config = value as Record<string, unknown>;
      base.proxies = extractProxies(config.proxies);
      base.proxyGroups = Array.isArray(config["proxy-groups"])
        ? (config["proxy-groups"] as unknown[])
        : [];
      base.ruleCount = Array.isArray(config.rules) ? config.rules.length : 0;
      base.otherKeys = Object.keys(config).filter(
        (k) => k !== "proxies" && k !== "proxy-groups" && k !== "rules",
      );
      base.originalDocument = document;
      break;
    }
    case "PROXIES_SECTION": {
      const config = value as Record<string, unknown>;
      base.proxies = extractProxies(config.proxies);
      base.otherKeys = Object.keys(config).filter((k) => k !== "proxies");
      break;
    }
    case "PROXY_LIST":
      base.proxies = extractProxies(value);
      break;
    case "SINGLE_PROXY":
      base.proxies = extractProxies([value]);
      break;
    case "UNKNOWN":
      break;
  }

  return base;
}
