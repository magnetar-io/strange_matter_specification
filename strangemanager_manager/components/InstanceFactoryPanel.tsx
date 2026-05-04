"use client";

import { useAppStore } from "@/store/use-app-store";
import { validateData } from "@/lib/validate";
import {
  isPlaceholderComponentClassification,
  isPlaceholderComponentType,
} from "@/lib/instance-identity";
import { useEffect, useMemo, useRef, useState } from "react";

function ComponentIdentityBlock(props: {
  data: unknown;
  onUpdate: (data: unknown) => void;
  onClearValMsg: () => void;
}) {
  const { data, onUpdate, onClearValMsg } = props;
  if (
    !data ||
    typeof data !== "object" ||
    Array.isArray(data) ||
    !("ComponentType" in data) ||
    !("ComponentClassification" in data)
  ) {
    return null;
  }
  const o = data as Record<string, unknown>;
  const typeVal =
    typeof o.ComponentType === "string" ? o.ComponentType : "";
  const classVal =
    typeof o.ComponentClassification === "string"
      ? o.ComponentClassification
      : "";
  const typePending = isPlaceholderComponentType(o.ComponentType);
  const classPending = isPlaceholderComponentClassification(
    o.ComponentClassification
  );
  const push = (patch: {
    ComponentType: string;
    ComponentClassification: string;
  }) => {
    onClearValMsg();
    onUpdate({ ...o, ...patch });
  };
  return (
    <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-3 space-y-3">
      <h2 className="text-sm font-semibold text-amber-200/95">
        Component identity (required)
      </h2>
      <p className="text-[11px] opacity-90">
        For every new instance, set the component type and classification.
        Other fields can stay generated until you change them in JSON below.
      </p>
      <label className="block text-xs space-y-1">
        <span className="font-medium">ComponentType</span>
        <input
          className="w-full text-sm font-mono border border-foreground/25 rounded px-2 py-1.5 bg-background"
          value={typeVal}
          onChange={(e) =>
            push({
              ComponentType: e.target.value,
              ComponentClassification: classVal,
            })
          }
          autoComplete="off"
          placeholder="e.g. Space, Equipment, …"
        />
        {typePending && (
          <span className="text-amber-300/90">
            Still using placeholder — replace with your type.
          </span>
        )}
      </label>
      <label className="block text-xs space-y-1">
        <span className="font-medium">ComponentClassification</span>
        <input
          className="w-full text-sm font-mono border border-foreground/25 rounded px-2 py-1.5 bg-background"
          value={classVal}
          onChange={(e) =>
            push({
              ComponentType: typeVal,
              ComponentClassification: e.target.value,
            })
          }
          autoComplete="off"
          placeholder="Classification for this component"
        />
        {classPending && (
          <span className="text-amber-300/90">
            Still using placeholder — replace with your classification.
          </span>
        )}
      </label>
    </div>
  );
}

export function InstanceFactoryPanel() {
  const {
    instances,
    addInstance,
    updateInstanceData,
    removeInstance,
    clearInstances,
    activeVersionId,
    versions,
  } = useAppStore();
  const [useFaker, setUseFaker] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const labelRef = useRef<HTMLInputElement>(null);
  const [valMsg, setValMsg] = useState<string | null>(null);

  const selected = useMemo(
    () => instances.find((i) => i.id === selectedId) ?? instances[0] ?? null,
    [instances, selectedId]
  );

  useEffect(() => {
    if (instances.length === 0) {
      setSelectedId(null);
      return;
    }
    if (selectedId == null || !instances.some((i) => i.id === selectedId)) {
      setSelectedId(instances[0].id!);
    }
  }, [instances, selectedId]);

  const vId = activeVersionId ?? versions[0]?.id;
  const schema = useMemo(() => {
    if (!vId) return null;
    return versions.find((x) => x.id === vId)?.schema ?? null;
  }, [vId, versions]);

  const onValidate = () => {
    if (!selected || !schema) {
      setValMsg("Pick an instance and ensure a version exists.");
      return;
    }
    const r = validateData(schema as object, selected.data);
    if (r.ok) setValMsg("Valid.");
    else {
      setValMsg(
        r.errors
          .map((e) => `${e.instancePath} ${e.message}`)
          .join(" | ") || "Invalid"
      );
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-3">
        <h2 className="text-sm font-semibold">Template generation</h2>
        <p className="text-xs opacity-70">
          New instances are built from the <strong>committed</strong> schema
          of the active version. After creating one, you must set{" "}
          <strong>ComponentType</strong> and{" "}
          <strong>ComponentClassification</strong> in the panel on the right
          (they are not auto-filled with real values).
        </p>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={useFaker}
            onChange={(e) => setUseFaker(e.target.checked)}
          />
          Fill with mock data (Faker)
        </label>
        <div className="flex flex-wrap items-end gap-2">
          <input
            ref={labelRef}
            className="text-sm font-mono border border-foreground/20 rounded px-2 py-1 bg-background flex-1 min-w-40"
            placeholder="Instance label"
          />
          <button
            type="button"
            className="text-sm px-3 py-1.5 rounded bg-foreground text-background"
            onClick={() =>
              void addInstance(
                labelRef.current?.value?.trim() || "",
                useFaker
              )
            }
          >
            New instance
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="text-xs px-2 py-1 rounded border border-foreground/20"
            onClick={() => void clearInstances()}
          >
            Clear all
          </button>
        </div>
        <ul className="text-sm max-h-64 overflow-y-auto space-y-1 pr-1">
          {instances.map((i) => (
            <li
              key={i.id!}
              className={`flex justify-between items-center border-b border-foreground/10 py-1 ${
                selectedId === i.id || (!selectedId && i === instances[0])
                  ? "text-foreground"
                  : "opacity-80"
              }`}
            >
              <button
                type="button"
                className="text-left font-mono text-xs flex-1 truncate"
                onClick={() => setSelectedId(i.id!)}
              >
                {i.id}: {i.label}
              </button>
              <button
                type="button"
                className="text-red-400 text-xs ml-2"
                onClick={() => void removeInstance(i.id!)}
              >
                delete
              </button>
            </li>
          ))}
        </ul>
        <p className="text-xs">
          <button
            type="button"
            className="text-blue-400 hover:underline"
            onClick={onValidate}
          >
            Ajv validate
          </button>
          {valMsg && (
            <span className="ml-2 font-mono text-xs opacity-90 break-all">
              {valMsg}
            </span>
          )}
        </p>
      </div>
      <div>
        {selected && (
          <div className="space-y-3">
            <ComponentIdentityBlock
              data={selected.data}
              onClearValMsg={() => setValMsg(null)}
              onUpdate={(d) => void updateInstanceData(selected.id!, d)}
            />
            <h2 className="text-sm font-semibold">Instance JSON</h2>
            <textarea
              className="w-full min-h-[360px] text-xs font-mono p-2 rounded border border-foreground/20 bg-background"
              value={JSON.stringify(selected.data, null, 2)}
              onChange={(e) => {
                try {
                  const p = JSON.parse(e.target.value) as unknown;
                  setValMsg(null);
                  void updateInstanceData(selected.id!, p);
                } catch {
                  /* let user finish typing; optional debounce in prod */
                }
              }}
            />
            <p className="text-[11px] opacity-60">
              You can also edit the same fields in JSON; the identity block
              above stays in sync. Use the Graph tab to set references.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
