"use client";

import { useAppStore } from "@/store/use-app-store";
import { RootPropertyEditor } from "./RootPropertyEditor";
import { useRef } from "react";

export function SchemaWorkbench() {
  const {
    draftText,
    setDraftText,
    draftError,
    versions,
    activeVersionId,
    commit,
    loadVersion,
    loadFileText,
  } = useAppStore();
  const labelRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const parsed: unknown = (() => {
    try {
      return JSON.parse(draftText) as unknown;
    } catch {
      return null;
    }
  })();

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-3 min-h-0">
        <h2 className="text-sm font-semibold">Loader &amp; raw editor</h2>
        <div>
          <input
            ref={fileRef}
            type="file"
            accept=".json,application/json"
            className="text-xs w-full sm:w-auto"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              const r = new FileReader();
              r.onload = () => {
                if (typeof r.result === "string") loadFileText(r.result);
              };
              r.readAsText(f);
            }}
          />
        </div>
        {draftError && (
          <p className="text-sm text-red-500 font-mono">{draftError}</p>
        )}
        <textarea
          className="w-full min-h-[360px] text-xs font-mono p-3 rounded border border-foreground/20 bg-background resize-y"
          value={draftText}
          onChange={(e) => setDraftText(e.target.value)}
          spellCheck={false}
        />
      </div>
      <div className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold">Root property form</h2>
          <p className="text-xs opacity-70 mt-1">
            Shorthand editing for top-level <code>properties</code>; the JSON
            editor stays the source of truth.
          </p>
          <div className="mt-2">
            <RootPropertyEditor
              schema={parsed}
              onSchemaChange={(s) =>
                setDraftText(JSON.stringify(s, null, 2))
              }
            />
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-sm font-semibold">Versioning (commits)</h2>
          <div className="flex flex-wrap items-end gap-2">
            <label className="text-xs block">
              Label
              <input
                ref={labelRef}
                className="block w-44 mt-0.5 text-sm font-mono border border-foreground/20 rounded px-2 py-1 bg-background"
                placeholder="v1.0.0"
              />
            </label>
            <button
              type="button"
              className="text-sm px-3 py-1.5 rounded bg-foreground text-background hover:opacity-90"
              onClick={() => {
                const l = labelRef.current?.value?.trim() || `v-${new Date().toISOString()}`;
                void commit(l);
                if (labelRef.current) labelRef.current.value = "";
              }}
            >
              Commit schema
            </button>
          </div>
        </div>
        <div>
          <h2 className="text-sm font-semibold">Version history</h2>
          <p className="text-xs opacity-70 mb-2">Active: {activeVersionId ?? "none"}</p>
          <ul className="max-h-40 overflow-y-auto text-xs space-y-1 pr-1">
            {versions.length === 0 && (
              <li className="opacity-60">No commits yet.</li>
            )}
            {versions.map((v) => (
              <li
                key={v.id!}
                className="flex items-center justify-between gap-2 border-b border-foreground/10 py-1"
              >
                <span className="font-mono truncate" title={v.label}>
                  {v.id}: {v.label}
                </span>
                <button
                  type="button"
                  className="shrink-0 text-[11px] text-blue-400 hover:underline"
                  onClick={() => void loadVersion(v.id!)}
                >
                  Load
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
