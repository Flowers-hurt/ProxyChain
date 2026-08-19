import { useMemo } from "react";
import { useAppStore } from "../store";
import { generateChains, type ChainNode } from "../core/chain";
import type { NormalizedConfig } from "../core/parser";
import type { ProxyNode } from "../core/types";

export interface ChainDerivation {
  config: NormalizedConfig | null;
  selectedNodes: ProxyNode[];
  allChains: ChainNode[];
  includedChains: ChainNode[];
}

export function chainKey(chain: ChainNode): string {
  return `${chain.nodeId}|${chain.residentialId}`;
}

// Single source of truth for chain generation so Step 4's preview and
// Step 5's output can never disagree on names or contents.
export function useChains(): ChainDerivation {
  const parseResult = useAppStore((s) => s.parseResult);
  const selectedIds = useAppStore((s) => s.selectedIds);
  const residentials = useAppStore((s) => s.residentials);
  const excludedChainKeys = useAppStore((s) => s.excludedChainKeys);

  return useMemo(() => {
    const config = parseResult?.ok ? parseResult.config : null;
    const selectedNodes = config
      ? config.proxies.filter((p) => selectedIds.includes(p.id))
      : [];
    const existingNames = config ? config.proxies.map((p) => p.name) : [];
    const allChains = generateChains(selectedNodes, residentials, existingNames);
    const includedChains = allChains.filter(
      (c) => !excludedChainKeys.includes(chainKey(c)),
    );
    return { config, selectedNodes, allChains, includedChains };
  }, [parseResult, selectedIds, residentials, excludedChainKeys]);
}
