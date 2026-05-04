"use client";

import { useAppStore, type AppTab } from "@/store/use-app-store";
import { useEffect } from "react";
import { SchemaWorkbench } from "./SchemaWorkbench";
import { InstanceFactoryPanel } from "./InstanceFactoryPanel";
import { MigrationPanel } from "./MigrationPanel";
import { GraphView } from "./GraphView";

const TABS: { id: AppTab; label: string }[] = [
  { id: "workbench", label: "Schema workbench" },
  { id: "factory", label: "Instance factory" },
  { id: "migration", label: "Migration" },
  { id: "graph", label: "Graph" },
];

export function ClientShell() {
  const { tab, setTab, isHydrated, hydrate, exportBundle } = useAppStore();

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  const onExport = () => {
    const b = exportBundle();
    const blob = new Blob([JSON.stringify(b, null, 2)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `strangemanager-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-foreground/15 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">SchemaGraph</h1>
          <p className="text-xs opacity-70 max-w-2xl">
            JSON schema lifecycle, mock instances, migration, and graph
            relationships (local-only via IndexedDB).
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {!isHydrated && (
            <span className="text-xs opacity-60">Loading data…</span>
          )}
          <button
            type="button"
            className="text-xs px-2 py-1.5 rounded border border-foreground/20 hover:bg-foreground/5"
            onClick={onExport}
          >
            Export JSON bundle
          </button>
        </div>
      </header>
      <nav className="flex flex-wrap gap-1 px-4 border-b border-foreground/10 bg-foreground/5">
        {TABS.map((t) => (
          <button
            type="button"
            key={t.id}
            className={
              "text-sm px-3 py-2 -mb-px border-b-2 " +
              (tab === t.id
                ? "border-foreground font-medium"
                : "border-transparent opacity-80 hover:opacity-100")
            }
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>
      <main className="flex-1 p-4 max-w-7xl w-full mx-auto">
        {tab === "workbench" && <SchemaWorkbench />}
        {tab === "factory" && <InstanceFactoryPanel />}
        {tab === "migration" && <MigrationPanel />}
        {tab === "graph" && <GraphView />}
      </main>
    </div>
  );
}
