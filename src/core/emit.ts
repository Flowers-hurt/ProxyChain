import { isSeq, stringify, YAMLSeq } from "yaml";
import type { NormalizedConfig } from "./parser/normalize";
import type { ChainNode } from "./chain";
import { buildProxyGroup } from "./chain";

export type OutputMode = "FULL" | "PROXIES_ONLY" | "PROXIES_AND_GROUPS";

export interface EmitOptions {
  mode: OutputMode;
  chains: ChainNode[];
  group?: { name: string } | null;
  config: NormalizedConfig;
}

const STRINGIFY_OPTIONS = { lineWidth: 0 } as const;

// FULL_CONFIG inputs are re-emitted from the original Document so comments,
// key order and unknown fields survive untouched; we only append.
function emitFromDocument(opts: EmitOptions): string {
  const doc = opts.config.originalDocument!.clone();

  const proxiesSeq = doc.getIn(["proxies"]);
  if (isSeq(proxiesSeq)) {
    for (const chain of opts.chains) proxiesSeq.add(doc.createNode(chain.config));
  } else if (opts.chains.length > 0) {
    doc.set("proxies", doc.createNode(opts.chains.map((c) => c.config)));
  }

  if (opts.group) {
    const groupNode = doc.createNode(
      buildProxyGroup(opts.group.name, opts.chains.map((c) => c.name)),
    );
    const groupsSeq = doc.getIn(["proxy-groups"]);
    if (isSeq(groupsSeq)) {
      groupsSeq.add(groupNode);
    } else {
      const seq = new YAMLSeq();
      seq.add(groupNode);
      doc.set("proxy-groups", seq);
    }
  }

  return doc.toString(STRINGIFY_OPTIONS);
}

// Partial inputs: emit only what the user provided plus what we generated.
function emitPartialFull(opts: EmitOptions): string {
  const out: Record<string, unknown> = {
    proxies: [
      ...opts.config.proxies.map((p) => p.raw),
      ...opts.chains.map((c) => c.config),
    ],
  };

  const groups: unknown[] = [...opts.config.proxyGroups];
  if (opts.group) {
    groups.push(buildProxyGroup(opts.group.name, opts.chains.map((c) => c.name)));
  }
  if (groups.length > 0) out["proxy-groups"] = groups;

  return stringify(out, STRINGIFY_OPTIONS);
}

export function emit(opts: EmitOptions): string {
  switch (opts.mode) {
    case "FULL":
      return opts.config.originalDocument
        ? emitFromDocument(opts)
        : emitPartialFull(opts);
    case "PROXIES_ONLY":
      return stringify({ proxies: opts.chains.map((c) => c.config) }, STRINGIFY_OPTIONS);
    case "PROXIES_AND_GROUPS": {
      const out: Record<string, unknown> = {
        proxies: opts.chains.map((c) => c.config),
      };
      if (opts.group) {
        out["proxy-groups"] = [
          buildProxyGroup(opts.group.name, opts.chains.map((c) => c.name)),
        ];
      }
      return stringify(out, STRINGIFY_OPTIONS);
    }
  }
}
