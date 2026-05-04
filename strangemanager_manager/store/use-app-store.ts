"use client";

import { create } from "zustand";
import {
  getDB,
  type InstanceRow,
  type SchemaVersionRow,
} from "@/lib/db";

export type AppTab = "workbench" | "factory" | "migration" | "graph";

type State = {
  tab: AppTab;
  draftText: string;
  draftError: string | null;
  activeVersionId: number | null;
  versions: SchemaVersionRow[];
  instances: InstanceRow[];
  linkField: string;
  isHydrated: boolean;
  setTab: (t: AppTab) => void;
  setDraftText: (t: string) => void;
  setLinkField: (f: string) => void;
  hydrate: () => Promise<void>;
  commit: (label: string) => Promise<void>;
  loadVersion: (id: number) => Promise<void>;
  loadFileText: (text: string) => void;
  addInstance: (label: string, useFaker: boolean) => Promise<void>;
  updateInstanceData: (id: number, data: unknown) => Promise<void>;
  removeInstance: (id: number) => Promise<void>;
  clearInstances: () => Promise<void>;
  exportBundle: () => {
    version: number;
    at: string;
    schema: unknown;
    versions: SchemaVersionRow[];
    instances: InstanceRow[];
  };
  applyDraftParse: () => { ok: true; schema: unknown } | { ok: false; error: string };
};

const initialDraft = `{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "id": { "type": "string" },
    "name": { "type": "string" }
  },
  "required": ["id", "name"]
}`;

function parseOrThrow(text: string): unknown {
  return JSON.parse(text) as unknown;
}

export const useAppStore = create<State>((set, get) => ({
  tab: "workbench",
  draftText: initialDraft,
  draftError: null,
  activeVersionId: null,
  versions: [],
  instances: [],
  linkField: "ComponentGUID",
  isHydrated: false,
  setTab: (t) => set({ tab: t }),
  setDraftText: (draftText) => {
    set({ draftText, draftError: null });
  },
  setLinkField: (linkField) => set({ linkField }),
  applyDraftParse: () => {
    const { draftText } = get();
    try {
      return { ok: true, schema: parseOrThrow(draftText) };
    } catch (e) {
      const m = e instanceof Error ? e.message : String(e);
      set({ draftError: m });
      return { ok: false, error: m };
    }
  },
  hydrate: async () => {
    if (typeof window === "undefined") return;
    const db = getDB();
    const versions = await db.schemaVersions
      .orderBy("createdAt")
      .reverse()
      .toArray();
    const instances = await db.instances
      .orderBy("createdAt")
      .reverse()
      .toArray();
    set({ versions, instances, isHydrated: true });
  },
  commit: async (label) => {
    const p = get().applyDraftParse();
    if (!p.ok) return;
    const { activeVersionId } = get();
    const db = getDB();
    const id = await db.schemaVersions.add({
      parentId: activeVersionId,
      label: label || `v-${Date.now()}`,
      schema: p.schema,
      createdAt: Date.now(),
    });
    const versions = await db.schemaVersions
      .orderBy("createdAt")
      .reverse()
      .toArray();
    set({ activeVersionId: id, versions, draftError: null });
  },
  loadVersion: async (id) => {
    const row = get().versions.find((v) => v.id === id);
    if (!row) return;
    set({
      activeVersionId: id,
      draftText: JSON.stringify(row.schema, null, 2),
      draftError: null,
    });
  },
  loadFileText: (text) => {
    get().applyDraftParse();
    try {
      const obj = parseOrThrow(text) as object;
      set({ draftText: JSON.stringify(obj, null, 2), draftError: null });
    } catch (e) {
      const m = e instanceof Error ? e.message : String(e);
      set({ draftText: text, draftError: m });
    }
  },
  addInstance: async (label, useFaker) => {
    const { activeVersionId, versions } = get();
    const vId = activeVersionId ?? versions[0]?.id;
    if (!vId) {
      set({
        draftError: "Commit a schema version first, or set an active version.",
      });
      return;
    }
    const db = getDB();
    const row = await db.schemaVersions.get(vId);
    if (!row) {
      set({ draftError: "Active schema version is missing; commit again or pick a version." });
      return;
    }
    const { buildInstanceFromSchema } = await import("@/lib/build-instance");
    const data = buildInstanceFromSchema(row.schema as object, { useFaker });
    await db.instances.add({
      versionId: vId,
      label: label || `Instance ${Date.now()}`,
      data,
      createdAt: Date.now(),
    });
    const instances = await db.instances
      .orderBy("createdAt")
      .reverse()
      .toArray();
    set({ instances, draftError: null });
  },
  updateInstanceData: async (id, data) => {
    const db = getDB();
    await db.instances.update(id, { data });
    const instances = await db.instances
      .orderBy("createdAt")
      .reverse()
      .toArray();
    set({ instances });
  },
  removeInstance: async (id) => {
    const db = getDB();
    await db.instances.delete(id);
    const instances = await db.instances
      .orderBy("createdAt")
      .reverse()
      .toArray();
    set({ instances });
  },
  clearInstances: async () => {
    const db = getDB();
    await db.instances.clear();
    set({ instances: [] });
  },
  exportBundle: () => {
    const p = get().applyDraftParse();
    const { versions, instances, activeVersionId } = get();
    return {
      version: 1,
      at: new Date().toISOString(),
      schema: p.ok ? p.schema : null,
      activeVersionId,
      versions,
      instances,
    };
  },
}));
