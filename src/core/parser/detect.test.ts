import { describe, expect, it } from "vitest";
import { parseSyntax } from "./syntax";
import { detectInputType } from "./detect";

function detect(input: string) {
  const result = parseSyntax(input);
  if (!result.ok) throw new Error(`syntax error: ${result.error.message}`);
  return detectInputType(result.value);
}

// Spec §19 acceptance cases, verbatim.
const CASE_1_FULL_CONFIG = `
mixed-port: 7890

proxies:
  - name: HK
    type: ss
    server: example.com
    port: 443
    cipher: chacha20-ietf-poly1305
    password: xxx

proxy-groups:
  - name: Proxy
    type: select
    proxies:
      - HK
      - DIRECT

rules:
  - MATCH,Proxy
`;

const CASE_2_PROXIES_SECTION = `
proxies:
  - name: HK
    type: ss
    server: example.com
    port: 443
    cipher: chacha20-ietf-poly1305
    password: xxx
`;

const CASE_3_PROXY_LIST = `
- name: HK
  type: ss
  server: example.com
  port: 443
  cipher: chacha20-ietf-poly1305
  password: xxx

- name: US
  type: ss
  server: example.com
  port: 443
  cipher: chacha20-ietf-poly1305
  password: xxx
`;

const CASE_4_SINGLE_PROXY = `
name: HK
type: ss
server: example.com
port: 443
cipher: chacha20-ietf-poly1305
password: xxx
`;

const CASE_5_INLINE = `
- {name: 🇭🇰 高级 专线 香港 07, server: example.com, port: 14527, type: anytls, password: "xxx", sni: example.com, skip-cert-verify: true, udp: true, tfo: false}
`;

describe("detectInputType", () => {
  it("Case 1: full Clash config → FULL_CONFIG", () => {
    expect(detect(CASE_1_FULL_CONFIG)).toBe("FULL_CONFIG");
  });

  it("Case 2: proxies only → PROXIES_SECTION", () => {
    expect(detect(CASE_2_PROXIES_SECTION)).toBe("PROXIES_SECTION");
  });

  it("Case 3: bare proxy array → PROXY_LIST", () => {
    expect(detect(CASE_3_PROXY_LIST)).toBe("PROXY_LIST");
  });

  it("Case 4: single proxy mapping → SINGLE_PROXY", () => {
    expect(detect(CASE_4_SINGLE_PROXY)).toBe("SINGLE_PROXY");
  });

  it("Case 5: inline flow-style proxy → PROXY_LIST", () => {
    expect(detect(CASE_5_INLINE)).toBe("PROXY_LIST");
  });

  it("full config without proxies still → FULL_CONFIG", () => {
    expect(detect("mixed-port: 7890\nmode: rule\n")).toBe("FULL_CONFIG");
  });

  it("array items with server+port but no type still count as proxies", () => {
    expect(detect("- {name: a, server: x, port: 1}\n")).toBe("PROXY_LIST");
  });

  it("unrecognized structures → UNKNOWN", () => {
    expect(detect("hello: world\n")).toBe("UNKNOWN");
    expect(detect("- 1\n- 2\n")).toBe("UNKNOWN");
    expect(detect("42\n")).toBe("UNKNOWN");
  });
});
