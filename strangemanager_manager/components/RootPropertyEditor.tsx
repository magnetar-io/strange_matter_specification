"use client";

import { useCallback } from "react";

const TYPE_OPTIONS = [
  "string",
  "number",
  "integer",
  "boolean",
  "object",
  "array",
] as const;

type TypeOpt = (typeof TYPE_OPTIONS)[number];

function isRecord(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

type Props = {
  schema: unknown;
  onSchemaChange: (s: object) => void;
};

/**
 * Edits the root `properties` map: key names and per-property `type` (subset).
 * Deep constraints stay in the JSON; this covers the plan's "form path" for root fields.
 */
export function RootPropertyEditor({ schema, onSchemaChange }: Props) {
  const onChange = useCallback(
    (updater: (props: Record<string, unknown>) => void) => {
      if (!isRecord(schema) || !isRecord(schema.properties)) {
        return;
      }
      const next = { ...schema } as Record<string, unknown>;
      const properties = { ...(next.properties as Record<string, unknown>) };
      updater(properties);
      onSchemaChange({ ...next, properties } as object);
    },
    [schema, onSchemaChange]
  );

  if (!isRecord(schema) || !isRecord(schema.properties)) {
    return (
      <p className="text-sm opacity-70">
        Open an object schema with a <code>properties</code> object to use the
        form editor, or use raw JSON in the workbench.
      </p>
    );
  }

  const props = schema.properties as Record<string, { type?: string | string[] }>;

  const setRow = (name: string, t: TypeOpt) => {
    onChange((p) => {
      const sub = p[name] && isRecord(p[name] as unknown) ? p[name] as Record<string, unknown> : { type: t };
      p[name] = { ...sub, type: t };
    });
  };

  const addRow = (name: string) => {
    if (!name.trim()) return;
    onChange((p) => {
      p[name] = { type: "string" as const };
    });
  };

  const remove = (name: string) => {
    onChange((p) => {
      delete p[name];
    });
  };

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">Root properties (quick form)</p>
      <ul className="space-y-2 text-sm max-h-56 overflow-y-auto pr-1">
        {Object.keys(props).map((k) => {
          const t = (
            Array.isArray(props[k]?.type) ? props[k]!.type![0] : props[k]?.type
          ) as string | undefined;
          const v = (TYPE_OPTIONS.includes(t as TypeOpt) ? t : "string") as TypeOpt;
          return (
            <li
              key={k}
              className="flex flex-wrap items-center gap-2 border border-foreground/15 rounded-md px-2 py-1"
            >
              <code className="shrink-0 text-xs font-mono">{k}</code>
              <select
                className="text-xs border border-foreground/20 rounded bg-background px-1.5 py-0.5"
                value={v}
                onChange={(e) => setRow(k, e.target.value as TypeOpt)}
              >
                {TYPE_OPTIONS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="ml-auto text-xs text-red-400 hover:underline"
                onClick={() => remove(k)}
              >
                Remove
              </button>
            </li>
          );
        })}
      </ul>
      <div className="flex gap-2">
        <input
          className="flex-1 min-w-0 text-xs font-mono border border-foreground/20 rounded bg-background px-2 py-1"
          id="new-prop"
          placeholder="newPropertyKey"
        />
        <button
          type="button"
          className="text-xs px-2 py-1 rounded border border-foreground/20 hover:bg-foreground/5"
          onClick={() => {
            const el = document.getElementById("new-prop") as HTMLInputElement | null;
            addRow(el?.value?.trim() ?? "");
            if (el) el.value = "";
          }}
        >
          Add property
        </button>
      </div>
    </div>
  );
}
