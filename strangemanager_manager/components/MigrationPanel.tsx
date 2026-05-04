"use client";

import { useAppStore } from "@/store/use-app-store";
import { applyMappings, buildMappingLines } from "@/lib/migrate";
import { validateData } from "@/lib/validate";
import { useMemo, useState } from "react";

export function MigrationPanel() {
  const { versions } = useAppStore();
  const [fromId, setFromId] = useState<number | "">("");
  const [toId, setToId] = useState<number | "">("");
  const [sourceText, setSourceText] = useState("{}");
  const [mappingText, setMappingText] = useState(
    "oldKey -> newKey\nDataAuthorIdentifier -> DataAuthorIdentifier"
  );
  const [outText, setOutText] = useState("");
  const [note, setNote] = useState<string | null>(null);

  const toSchema = useMemo(() => {
    if (toId === "") return null;
    return versions.find((v) => v.id === toId)?.schema as object | undefined;
  }, [toId, versions]);

  const run = () => {
    let src: unknown;
    try {
      src = JSON.parse(sourceText) as unknown;
    } catch (e) {
      setNote(e instanceof Error ? e.message : "Source parse error");
      return;
    }
    const maps = buildMappingLines(mappingText);
    const out = applyMappings(src, maps);
    setOutText(JSON.stringify(out, null, 2));
    if (toSchema) {
      const v = validateData(toSchema, out);
      if (v.ok) setNote("Migrated and passes Ajv for the target schema.");
      else {
        setNote(
          v.errors.map((e) => `${e.instancePath} ${e.message}`).join(" | ")
        );
      }
    } else {
      setNote("Migrated (no target schema to validate).");
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold">Migration (path mapping)</h2>
      <p className="text-xs opacity-70 max-w-2xl">
        One line per mapping, <code>fromPath -&gt; toPath</code> in dot
        notation. The right-hand value is set from the left. Then validate
        against the <strong>target</strong> schema.
      </p>
      <div className="flex flex-wrap gap-3 text-sm">
        <label>
          From version (ref only)
          <select
            className="ml-1 border border-foreground/20 rounded bg-background px-2 py-1"
            value={fromId === "" ? "" : fromId}
            onChange={(e) =>
              setFromId(
                e.target.value === "" ? "" : parseInt(e.target.value, 10)
              )
            }
          >
            <option value="">—</option>
            {versions.map((v) => (
              <option key={v.id!} value={v.id!}>
                {v.id} {v.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          To schema
          <select
            className="ml-1 border border-foreground/20 rounded bg-background px-2 py-1"
            value={toId === "" ? "" : toId}
            onChange={(e) =>
              setToId(
                e.target.value === "" ? "" : parseInt(e.target.value, 10)
              )
            }
          >
            <option value="">—</option>
            {versions.map((v) => (
              <option key={`t-${v.id!}`} value={v.id!}>
                {v.id} {v.label}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="text-sm px-2 py-1 rounded bg-foreground/10"
          onClick={() => {
            if (fromId === "") {
              setNote("Pick a source version.");
              return;
            }
            const row = versions.find((v) => v.id === fromId);
            if (!row) return;
            setSourceText(JSON.stringify(row.schema, null, 2));
            setNote("Pasted source version JSON (example — usually you migrate instance data).");
          }}
        >
          Fill source with version JSON (example)
        </button>
      </div>
      <p className="text-[11px] opacity-60">
        In practice, paste a <strong>data instance</strong> JSON in the
        left box, not a schema, then map its keys to the target model.
      </p>
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <h3 className="text-xs font-medium mb-1">Source JSON</h3>
          <textarea
            className="w-full min-h-[200px] text-xs font-mono p-2 rounded border border-foreground/20 bg-background"
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            spellCheck={false}
          />
        </div>
        <div>
          <h3 className="text-xs font-medium mb-1">Mappings (one per line)</h3>
          <textarea
            className="w-full min-h-[200px] text-xs font-mono p-2 rounded border border-foreground/20 bg-background"
            value={mappingText}
            onChange={(e) => setMappingText(e.target.value)}
            spellCheck={false}
          />
        </div>
      </div>
      <div className="flex gap-2 items-center">
        <button
          type="button"
          className="text-sm px-3 py-1.5 rounded bg-foreground text-background"
          onClick={run}
        >
          Apply + validate
        </button>
        {note && <span className="text-xs font-mono break-all">{note}</span>}
      </div>
      {outText && (
        <div>
          <h3 className="text-xs font-medium mb-1">Result</h3>
          <pre className="text-xs font-mono p-2 rounded border border-foreground/15 max-h-64 overflow-auto">
            {outText}
          </pre>
        </div>
      )}
    </div>
  );
}
