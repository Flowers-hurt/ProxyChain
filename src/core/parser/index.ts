import type { YamlError } from "../types";
import { parseSyntax } from "./syntax";
import { detectInputType } from "./detect";
import { normalize, type NormalizedConfig } from "./normalize";

export type ParseResult =
  | { ok: true; config: NormalizedConfig }
  | { ok: false; error: YamlError };

// Input → Syntax Parse → Structure Detection → Normalization → Proxy Extraction
export function parseInput(input: string): ParseResult {
  const syntax = parseSyntax(input);
  if (!syntax.ok) return { ok: false, error: syntax.error };
  const inputType = detectInputType(syntax.value);
  return { ok: true, config: normalize(syntax.value, inputType, syntax.document) };
}

export { parseSyntax } from "./syntax";
export { detectInputType } from "./detect";
export { normalize, type NormalizedConfig } from "./normalize";
