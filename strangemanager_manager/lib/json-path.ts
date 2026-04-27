/**
 * Simple dot-path reader/writer for plain objects.
 * Bracket segments are not supported; use `a.b.c` only.
 */
export function getByPath(obj: unknown, path: string): unknown {
  if (path === "" || path === ".") return obj;
  if (obj === null || obj === undefined || typeof obj !== "object") {
    return undefined;
  }
  const parts = path.split(".");
  let cur: unknown = obj;
  for (const p of parts) {
    if (cur === null || cur === undefined || typeof cur !== "object") {
      return undefined;
    }
    cur = (cur as Record<string, unknown>)[p];
  }
  return cur;
}

export function setByPath(
  root: unknown,
  path: string,
  value: unknown
): unknown {
  if (path === "" || path === ".") return value;
  if (root === null || root === undefined || typeof root !== "object") {
    return root;
  }
  const parts = path.split(".");
  let data: unknown;
  try {
    data = JSON.parse(JSON.stringify(root));
  } catch {
    return root;
  }
  let cur: unknown = data;
  for (let i = 0; i < parts.length - 1; i += 1) {
    const p = parts[i];
    if (cur && typeof cur === "object" && p in (cur as object)) {
      cur = (cur as Record<string, unknown>)[p];
    } else {
      return root;
    }
  }
  const last = parts[parts.length - 1]!;
  if (cur && typeof cur === "object" && !Array.isArray(cur)) {
    (cur as Record<string, unknown>)[last] = value;
  }
  return data;
}
