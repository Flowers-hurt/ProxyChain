import { Document, parseDocument } from "yaml";
import type { YamlError } from "../types";

export type SyntaxResult =
  | { ok: true; document: Document; value: unknown }
  | { ok: false; error: YamlError };

export function parseSyntax(input: string): SyntaxResult {
  if (input.trim() === "") {
    return { ok: false, error: { line: 1, column: 1, message: "Input is empty" } };
  }

  const document = parseDocument(input, { strict: false });
  const fatal = document.errors[0];
  if (fatal) {
    const [line, column] = fatal.linePos?.[0]
      ? [fatal.linePos[0].line, fatal.linePos[0].col]
      : [1, 1];
    return { ok: false, error: { line, column, message: fatal.message.split("\n")[0] } };
  }

  const value = document.toJS() as unknown;
  if (value === null || value === undefined) {
    return { ok: false, error: { line: 1, column: 1, message: "Input is empty" } };
  }

  return { ok: true, document, value };
}
