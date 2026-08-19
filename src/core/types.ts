export type InputType =
  | "FULL_CONFIG"
  | "PROXIES_SECTION"
  | "PROXY_LIST"
  | "SINGLE_PROXY"
  | "UNKNOWN";

export interface ProxyNode {
  id: string;
  name: string;
  type: string;
  server?: string;
  port?: number;
  raw: Record<string, unknown>;
}

export interface YamlError {
  line: number;
  column: number;
  message: string;
}
