import { setByPath } from "@/lib/json-path";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isIdLikeString(s: string): boolean {
  return UUID_RE.test(s) || s.length > 8;
}

type StringLeaf = { path: string; value: string };

export function collectStringLeaves(
  value: unknown,
  base = "",
  depth = 0
): StringLeaf[] {
  if (depth > 20) return [];
  if (typeof value === "string" && isIdLikeString(value)) {
    return [{ path: base || "root", value: value.trim() }];
  }
  if (value === null || value === undefined) return [];
  if (Array.isArray(value)) {
    return value.flatMap((v, i) =>
      collectStringLeaves(
        v,
        base ? `${base}.${i}` : String(i),
        depth + 1
      )
    );
  }
  if (typeof value === "object") {
    const o = value as Record<string, unknown>;
    return Object.keys(o).flatMap((k) => {
      const p = base ? `${base}.${k}` : k;
      return collectStringLeaves(o[k], p, depth + 1);
    });
  }
  return [];
}

export function getComponentIdentity(data: unknown): {
  label: string;
  primaryId: string | null;
} {
  if (data && typeof data === "object" && !Array.isArray(data)) {
    const o = data as Record<string, unknown>;
    const c =
      typeof o.ComponentType === "string" ? o.ComponentType : "Component";
    const id =
      typeof o.ComponentGUID === "string" ? o.ComponentGUID : null;
    const eid = typeof o.EntityGUID === "string" ? o.EntityGUID : null;
    return { label: c, primaryId: id ?? eid };
  }
  return { label: "Node", primaryId: null };
}

export type InferredEdge = {
  fromInstanceId: number;
  toInstanceId: number;
  fieldPath: string;
  kind: "field-match";
};

export function inferEdges(
  instances: { id: number; data: unknown }[]
): InferredEdge[] {
  const byPrimary = new Map<string, number>();
  for (const inst of instances) {
    const { primaryId } = getComponentIdentity(inst.data);
    if (primaryId) {
      byPrimary.set(primaryId, inst.id);
    }
  }
  const edges: InferredEdge[] = [];
  const seen = new Set<string>();
  for (const inst of instances) {
    for (const leaf of collectStringLeaves(inst.data)) {
      const target = byPrimary.get(leaf.value);
      if (target === undefined || target === inst.id) {
        continue;
      }
      const k = `${inst.id}->${target}:${leaf.path}`;
      if (seen.has(k)) continue;
      seen.add(k);
      edges.push({
        fromInstanceId: inst.id,
        toInstanceId: target,
        fieldPath: leaf.path,
        kind: "field-match",
      });
    }
  }
  return edges;
}

export function connectInstances(
  source: unknown,
  target: unknown,
  fieldPath: string
): unknown {
  const t = getComponentIdentity(target);
  const v = t.primaryId ?? t.label;
  if (typeof v !== "string" || v === "Node") {
    return source;
  }
  return setByPath(source, fieldPath, v);
}
