import { describe, expect, it } from "vitest";
import { parseBatch, parseResidential } from "./residential";

describe("parseBatch", () => {
  it("parses host:port:user:pass lines", () => {
    const { proxies, errors } = parseBatch(
      "1.2.3.4:8080:alice:secret\nresi.example.com:1080:bob:pw2\n",
    );
    expect(errors).toEqual([]);
    expect(proxies).toHaveLength(2);
    expect(proxies[0]).toMatchObject({
      server: "1.2.3.4",
      port: 8080,
      username: "alice",
      password: "secret",
      type: "socks5",
    });
    expect(proxies[1].server).toBe("resi.example.com");
  });

  it("parses host:port lines without credentials", () => {
    const { proxies, errors } = parseBatch("1.2.3.4:1080\n");
    expect(errors).toEqual([]);
    expect(proxies[0].username).toBeUndefined();
    expect(proxies[0].password).toBeUndefined();
  });

  it("respects the default type", () => {
    const { proxies } = parseBatch("1.2.3.4:8080:u:p\n", "http");
    expect(proxies[0].type).toBe("http");
  });

  it("skips blank lines and comments", () => {
    const { proxies, errors } = parseBatch("\n# comment\n1.2.3.4:1080\n\n");
    expect(errors).toEqual([]);
    expect(proxies).toHaveLength(1);
  });

  it("reports bad lines with line numbers without dropping good ones", () => {
    const { proxies, errors } = parseBatch("1.2.3.4:1080\nnot-a-proxy\n5.6.7.8:abc\n");
    expect(proxies).toHaveLength(1);
    expect(errors).toHaveLength(2);
    expect(errors[0].line).toBe(2);
    expect(errors[1].line).toBe(3);
  });

  it("generates unique ids and readable default names", () => {
    const { proxies } = parseBatch("1.2.3.4:1080\n1.2.3.4:1081\n");
    expect(new Set(proxies.map((p) => p.id)).size).toBe(2);
    expect(proxies[0].name).toContain("1.2.3.4");
  });
});

describe("parseResidential", () => {
  it("still parses host:port:user:pass lines", () => {
    const { proxies, errors } = parseResidential("1.2.3.4:8080:alice:secret\n");
    expect(errors).toEqual([]);
    expect(proxies[0]).toMatchObject({
      server: "1.2.3.4",
      port: 8080,
      username: "alice",
      password: "secret",
    });
  });

  it("parses a single YAML proxy mapping", () => {
    const { proxies, errors } = parseResidential(
      `type: socks5
server: "38.122.20.90"
port: 30150
username: "960c4aaa"
password: "d166eccf"`,
    );
    expect(errors).toEqual([]);
    expect(proxies).toHaveLength(1);
    expect(proxies[0]).toMatchObject({
      type: "socks5",
      server: "38.122.20.90",
      port: 30150,
      username: "960c4aaa",
      password: "d166eccf",
    });
    expect(proxies[0].name).toBe("38.122.20.90:30150");
  });

  it("parses a YAML proxies: section with several exits", () => {
    const { proxies } = parseResidential(
      `proxies:
  - {name: US-Resi, type: socks5, server: 1.2.3.4, port: 1080, username: u, password: p}
  - {name: HK-Resi, type: http, server: 5.6.7.8, port: 3128}`,
    );
    expect(proxies).toHaveLength(2);
    expect(proxies[0].name).toBe("US-Resi");
    expect(proxies[1]).toMatchObject({ type: "http", server: "5.6.7.8", port: 3128 });
  });

  it("parses a bare YAML proxy list", () => {
    const { proxies } = parseResidential(
      `- {type: socks5, server: 1.2.3.4, port: 1080}
- {type: socks5, server: 5.6.7.8, port: 1081}`,
    );
    expect(proxies).toHaveLength(2);
  });

  it("keeps extra fields so they survive into the chain node", () => {
    const { proxies } = parseResidential(
      `type: socks5
server: 1.2.3.4
port: 1080
udp: true
tls: true`,
    );
    expect(proxies[0].extra).toMatchObject({ udp: true, tls: true });
  });

  it("reports YAML proxies missing a server or port", () => {
    const { proxies, errors } = parseResidential(
      `proxies:
  - {name: good, type: socks5, server: 1.2.3.4, port: 1080}
  - {name: bad, type: socks5, username: u}`,
    );
    expect(proxies).toHaveLength(1);
    expect(errors).toHaveLength(1);
  });
});
