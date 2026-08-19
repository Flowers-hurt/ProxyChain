import { create } from "zustand";
import type { ParseResult } from "./core/parser";
import type { ResidentialProxy } from "./core/residential";
import type { OutputMode } from "./core/emit";

export type InputMode = "upload" | "paste";

export interface AppState {
  step: number;
  inputMode: InputMode;
  rawInput: string;
  fileName: string | null;
  parseResult: ParseResult | null;
  selectedIds: string[];
  residentials: ResidentialProxy[];
  excludedChainKeys: string[]; // `${nodeId}|${residentialId}` pairs unticked in Step 4
  createGroup: boolean;
  groupName: string;
  outputMode: OutputMode | null; // null = derive default from input type

  setStep: (step: number) => void;
  setInputMode: (mode: InputMode) => void;
  setInput: (raw: string, fileName: string | null, result: ParseResult | null) => void;
  setSelectedIds: (ids: string[]) => void;
  addResidentials: (proxies: ResidentialProxy[]) => void;
  removeResidential: (id: string) => void;
  toggleChain: (key: string) => void;
  setCreateGroup: (on: boolean) => void;
  setGroupName: (name: string) => void;
  setOutputMode: (mode: OutputMode) => void;
  reset: () => void;
}

export const DEFAULT_GROUP_NAME = "🛡️ 住宅链式代理";

const initial = {
  step: 1,
  inputMode: "upload" as InputMode,
  rawInput: "",
  fileName: null,
  parseResult: null,
  selectedIds: [],
  residentials: [],
  excludedChainKeys: [],
  createGroup: true,
  groupName: DEFAULT_GROUP_NAME,
  outputMode: null,
};

export const useAppStore = create<AppState>((set) => ({
  ...initial,

  setStep: (step) => set({ step }),
  setInputMode: (inputMode) => set({ inputMode }),
  setInput: (rawInput, fileName, parseResult) =>
    set({
      rawInput,
      fileName,
      parseResult,
      // New input invalidates downstream choices.
      selectedIds:
        parseResult?.ok === true
          ? parseResult.config.proxies.map((p) => p.id)
          : [],
      excludedChainKeys: [],
      outputMode: null,
    }),
  setSelectedIds: (selectedIds) => set({ selectedIds }),
  addResidentials: (proxies) =>
    set((s) => ({ residentials: [...s.residentials, ...proxies] })),
  removeResidential: (id) =>
    set((s) => ({ residentials: s.residentials.filter((r) => r.id !== id) })),
  toggleChain: (key) =>
    set((s) => ({
      excludedChainKeys: s.excludedChainKeys.includes(key)
        ? s.excludedChainKeys.filter((k) => k !== key)
        : [...s.excludedChainKeys, key],
    })),
  setCreateGroup: (createGroup) => set({ createGroup }),
  setGroupName: (groupName) => set({ groupName }),
  setOutputMode: (outputMode) => set({ outputMode }),
  reset: () => set(initial),
}));

// "FULL" is the right default for both cases: for FULL_CONFIG it preserves the
// original document; for partial input it emits provided sections + generated.
export function defaultOutputMode(): OutputMode {
  return "FULL";
}
