"use client";

import {
  Background,
  Connection,
  Controls,
  Edge,
  Handle,
  MiniMap,
  Node,
  Position,
  ReactFlow,
  addEdge,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useAppStore } from "@/store/use-app-store";
import { connectInstances, getComponentIdentity, inferEdges } from "@/lib/graph-refs";
import { useCallback, useEffect, useMemo } from "react";

const nodeW = 220;

type CustomData = { label: string; sub: string; instanceId: number };

const InstanceNode = ({
  data,
}: {
  data: { label: string; sub: string; instanceId: number };
}) => {
  return (
    <div className="px-2 py-1.5 bg-background border border-foreground/30 rounded shadow-sm text-xs w-[200px]">
      <div className="font-semibold truncate" title={data.sub}>
        {data.label}
      </div>
      <div className="font-mono text-[10px] opacity-70 truncate">{data.sub}</div>
      <Handle type="target" position={Position.Top} className="!bg-foreground" />
      <Handle type="source" position={Position.Bottom} className="!bg-foreground" />
    </div>
  );
};

const nodeTypes = { instance: InstanceNode };

function layoutNodes(
  instances: { id: number; data: unknown }[]
): Node<CustomData, "instance">[] {
  return instances.map((i, index) => {
    const c = getComponentIdentity(i.data);
    const col = index % 4;
    const row = Math.floor(index / 4);
    return {
      id: `i-${i.id}`,
      type: "instance",
      position: { x: 40 + col * (nodeW + 40), y: 40 + row * 120 },
      data: {
        instanceId: i.id,
        label: c.label,
        sub: c.primaryId ? String(c.primaryId).slice(0, 20) : String(i.id),
      },
    };
  });
}

export function GraphView() {
  const { instances, linkField, setLinkField, updateInstanceData } =
    useAppStore();
  const [nodes, setNodes, onNodesChange] = useNodesState<
    Node<CustomData, "instance">
  >([] as Node<CustomData, "instance">[]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const instList = useMemo(
    () =>
      instances
        .filter((x) => x.id != null)
        .map((x) => ({ id: x.id!, data: x.data })),
    [instances]
  );

  useEffect(() => {
    setNodes(layoutNodes(instList));
  }, [instList, setNodes]);

  const inferred = useMemo(() => inferEdges(instList), [instList]);

  useEffect(() => {
    setEdges(
      inferred.map((e, n) => ({
        id: `e-${e.fromInstanceId}-${e.toInstanceId}-${n}`,
        source: `i-${e.fromInstanceId}`,
        target: `i-${e.toInstanceId}`,
        label: e.fieldPath,
        animated: true,
      }))
    );
  }, [inferred, setEdges]);

  const onConnect = useCallback(
    (c: Connection) => {
      setEdges((eds) => addEdge({ ...c, animated: true }, eds));
      const src = c.source;
      const tgt = c.target;
      if (!src || !tgt) return;
      const sId = parseInt(src.replace(/^i-/, ""), 10);
      const tId = parseInt(tgt.replace(/^i-/, ""), 10);
      if (Number.isNaN(sId) || Number.isNaN(tId) || sId === tId) return;
      const a = instList.find((i) => i.id === sId);
      const b = instList.find((i) => i.id === tId);
      if (!a || !b) return;
      const next = connectInstances(a.data, b.data, linkField);
      if (next !== a.data) {
        void updateInstanceData(sId, next);
      }
    },
    [setEdges, instList, linkField, updateInstanceData]
  );

  const firstKeys = useMemo(() => {
    const f = instList[0];
    if (!f || f.data == null || typeof f.data !== "object") {
      return ["ComponentGUID", "EntityGUID", "id"];
    }
    return [
      ...Object.keys(f.data as object).filter(
        (k) => typeof (f.data as Record<string, unknown>)[k] === "string"
      ),
    ].slice(0, 20);
  }, [instList]);

  return (
    <div className="h-[min(70vh,720px)] w-full border border-foreground/20 rounded overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 px-2 py-1 text-xs border-b border-foreground/10 bg-foreground/5">
        <label>
          Set reference on source: field
          <select
            className="ml-1 border border-foreground/20 rounded bg-background px-1.5"
            value={linkField}
            onChange={(e) => setLinkField(e.target.value)}
          >
            {Array.from(
              new Set([...firstKeys, "ComponentGUID", "EntityGUID", "id"])
            ).map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </label>
        <span className="opacity-70 max-w-prose">
          Inferred edges from matching GUID-like strings; connect handles to
          set the chosen field to the target&apos;s id.
        </span>
      </div>
      <div className="h-[calc(100%-2.5rem)]">
        <ReactFlow
          fitView
          nodeTypes={nodeTypes}
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
        >
          <Background />
          <MiniMap pannable />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
}
