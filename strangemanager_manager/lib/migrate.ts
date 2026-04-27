import { getByPath, setByPath } from "@/lib/json-path";

export type PathMapping = { from: string; to: string };

/**
 * Remaps data by moving values from `from` paths to `to` paths (dot notation).
 * Empty `from` means set `to` to undefined (clear) — not used here.
 */
export function applyMappings(
  source: unknown,
  mappings: PathMapping[]
): unknown {
  let out: unknown =
    source === null || source === undefined
      ? {}
      : JSON.parse(JSON.stringify(source));
  for (const m of mappings) {
    if (!m.to.trim()) continue;
    if (!m.from.trim()) {
      out = setByPath(out, m.to, undefined);
      continue;
    }
    const v = getByPath(out, m.from);
    out = setByPath(out, m.to, v);
  }
  return out;
}

export function buildMappingLines(text: string): PathMapping[] {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const [from, to] = line.split("->").map((s) => s.trim());
      return { from: from ?? "", to: to ?? from ?? "" };
    })
    .filter((m) => m.to || m.from);
}
