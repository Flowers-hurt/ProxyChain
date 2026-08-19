import { describe, expect, it } from "vitest";
import { parseBatch } from "./residential";

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
