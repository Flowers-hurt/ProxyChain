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
