import { useEffect, useMemo, useRef, useState } from "react";
import {
  applyStep,
  createGame,
  isFlipLabel,
  listCardPlayLabels,
  maxPathId,
  playsForPath,
  replayDeal,
  stepFromLabel,
} from "@/lib/solitaire/engine";
import type { MoveLogEntry } from "@/lib/solitaire/types";
import { cn } from "@/lib/utils";

type TreeNode = {
  id: string;
  label: string;
  short: string;
  live: boolean;
  tried: boolean;
  current: boolean;
  children: TreeNode[];
  x: number;
  y: number;
};

function strip(label: string): string {
  return label.replace(/^\*\s*/, "").trim();
}

function shortLabel(label: string): string {
  const text = strip(label);
  if (text.includes(" then ")) {
    return text
      .split(" then ")
      .map((part) => part.split(" ")[0] ?? part)
      .join("+");
  }
  const head = text.split(" ")[0] ?? text;
  return head.length > 10 ? `${head.slice(0, 9)}…` : head;
}

function ensureChild(parent: TreeNode, id: string, label: string): TreeNode {
  let child = parent.children.find((node) => node.id === id);
  if (!child) {
    child = {
      id,
      label,
      short: shortLabel(label),
      live: false,
      tried: false,
      current: false,
      children: [],
      x: 0,
      y: 0,
    };
    parent.children.push(child);
  }
  return child;
}

function markLive(node: TreeNode, id: string): TreeNode | null {
  if (node.id === id) {
    node.live = true;
    return node;
  }
  for (const child of node.children) {
    const hit = markLive(child, id);
    if (hit) {
      node.live = true;
      return hit;
    }
  }
  return null;
}

function findNode(node: TreeNode, id: string): TreeNode | null {
  if (node.id === id) return node;
  for (const child of node.children) {
    const hit = findNode(child, id);
    if (hit) return hit;
  }
  return null;
}

function buildTree(
  log: MoveLogEntry[],
  currentPath: number,
  seed: number,
  drawCount: 1 | 3,
  dealId: number,
): TreeNode {
  const root: TreeNode = {
    id: "root",
    label: "Deal",
    short: "Deal",
    live: true,
    tried: true,
    current: false,
    children: [],
    x: 0,
    y: 0,
  };
  const plays = log.filter((row) => row.action !== "undo");
  const maxPath = maxPathId(plays);
  const choiceId = (path: number, move: number, label: string) =>
    `p${path}m${move}:${strip(label)}`;
  const origin = createGame({ seed, drawCount, dealId });
  const triedOf = (row: (typeof plays)[number]) => {
    const tried = new Set<string>();
    tried.add(strip(row.label));
    row.tried?.forEach((item) => tried.add(strip(item)));
    row.hints?.forEach((hint) => {
      if (hint.startsWith("*")) tried.add(strip(hint));
    });
    return tried;
  };

  for (let path = 1; path <= maxPath; path++) {
    const rows = playsForPath(log, path);
    let cursor = root;
    let board = origin;
    for (const row of rows) {
      const pathId = row.parentPath ?? row.path ?? 1;
      const move = row.move ?? row.n;
      const taken = strip(row.label);
      const tried = triedOf(row);
      const drew =
        row.action === "draw" ||
        row.action === "redeal" ||
        isFlipLabel(row.label);
      const cards = listCardPlayLabels(board);
      const applyRow = () => {
        const step = row.step ?? stepFromLabel(board, row.label);
        return step ? applyStep(board, step) : replayDeal(board, [row]);
      };
      if (drew && cards.length === 0) {
        const after = applyRow();
        if (!after) break;
        board = after;
        continue;
      }
      for (const label of cards) {
        const child = ensureChild(cursor, choiceId(pathId, move, label), label);
        if (tried.has(strip(label))) child.tried = true;
      }
      if (drew) {
        const after = applyRow();
        if (!after) break;
        board = after;
        continue;
      }
      const child = ensureChild(cursor, choiceId(pathId, move, taken), taken);
      child.tried = true;
      const after = applyRow();
      if (!after) break;
      board = after;
      cursor = child;
    }
  }

  const liveRows = plays.filter((row) => (row.path ?? 1) === currentPath);
  const lastCard = [...liveRows]
    .reverse()
    .find(
      (row) =>
        row.action !== "draw" &&
        row.action !== "redeal" &&
        !isFlipLabel(row.label),
    );
  const last = lastCard ?? liveRows[liveRows.length - 1];
  if (last && last === lastCard) {
    const id = choiceId(
      last.parentPath ?? last.path ?? 1,
      last.move ?? last.n,
      last.label,
    );
    const marked = markLive(root, id);
    if (marked) marked.current = true;
    else root.current = true;
  } else {
    root.current = true;
  }
  return root;
}

function layout(node: TreeNode, depth: number, start: number, end: number, gap: number) {
  const mid = (start + end) / 2;
  node.x = Math.cos(mid) * depth * gap;
  node.y = Math.sin(mid) * depth * gap;
  const kids = node.children;
  if (kids.length === 0) return;
  const span = (end - start) / kids.length;
  kids.forEach((child, i) => {
    layout(child, depth + 1, start + i * span, start + (i + 1) * span, gap);
  });
}

function collect(node: TreeNode, nodes: TreeNode[], edges: { from: TreeNode; to: TreeNode }[]) {
  nodes.push(node);
  for (const child of node.children) {
    edges.push({ from: node, to: child });
    collect(child, nodes, edges);
  }
}

function svgPoint(svg: SVGSVGElement, clientX: number, clientY: number) {
  const pt = svg.createSVGPoint();
  pt.x = clientX;
  pt.y = clientY;
  const ctm = svg.getScreenCTM();
  if (!ctm) return { x: 0, y: 0 };
  const mapped = pt.matrixTransform(ctm.inverse());
  return { x: mapped.x, y: mapped.y };
}

export function SearchTree({
  log,
  path,
  seed,
  drawCount,
  dealId,
}: {
  log: MoveLogEntry[];
  path: number;
  seed: number;
  drawCount: 1 | 3;
  dealId: number;
}) {
  const signature = useMemo(() => {
    let out = `${path}|${seed}|${drawCount}|${dealId}|`;
    for (const row of log) {
      if (row.action === "undo" || row.action === "draw" || row.action === "redeal") {
        continue;
      }
      if (isFlipLabel(row.label)) continue;
      out += `${row.path}:${row.move}:${row.label}:${(row.tried ?? []).length};`;
    }
    return out;
  }, [dealId, drawCount, log, path, seed]);

  const { nodes, edges, size } = useMemo(() => {
    const root = buildTree(log, path, seed, drawCount, dealId);
    const count = { n: 0 };
    const walk = (node: TreeNode) => {
      count.n += 1;
      node.children.forEach(walk);
    };
    walk(root);
    const depth = Math.max(1, Math.ceil(Math.sqrt(count.n)));
    const gap = Math.max(48, Math.min(78, 240 / depth));
    layout(root, 0, -Math.PI / 2, (3 * Math.PI) / 2, gap);
    const nodes: TreeNode[] = [];
    const edges: { from: TreeNode; to: TreeNode }[] = [];
    collect(root, nodes, edges);
    let max = 40;
    for (const node of nodes) {
      max = Math.max(max, Math.hypot(node.x, node.y) + 28);
    }
    return { nodes, edges, size: Math.ceil(max * 2 + 24) };
  }, [signature]);

  const cx = size / 2;
  const cy = size / 2;
  const svgRef = useRef<SVGSVGElement>(null);
  const groupRef = useRef<SVGGElement>(null);
  const viewRef = useRef({ x: 0, y: 0, k: 1 });
  const dragRef = useRef<{
    pointer: number;
    mx: number;
    my: number;
    vx: number;
    vy: number;
  } | null>(null);
  const [dragging, setDragging] = useState(false);

  const applyView = () => {
    const { x, y, k } = viewRef.current;
    groupRef.current?.setAttribute("transform", `translate(${x} ${y}) scale(${k})`);
  };

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      event.stopPropagation();
      const { x, y, k } = viewRef.current;
      const point = svgPoint(svg, event.clientX, event.clientY);
      const factor = event.deltaY < 0 ? 1.12 : 1 / 1.12;
      const next = Math.min(8, Math.max(0.25, k * factor));
      const wx = (point.x - x) / k;
      const wy = (point.y - y) / k;
      viewRef.current = {
        k: next,
        x: point.x - wx * next,
        y: point.y - wy * next,
      };
      applyView();
    };
    svg.addEventListener("wheel", onWheel, { passive: false });
    return () => svg.removeEventListener("wheel", onWheel);
  }, []);

  return (
    <div className="search-pop" role="img" aria-label="DFS search tree">
      <p className="search-pop-kicker">DFS tree · scroll to zoom · drag to pan</p>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${size} ${size}`}
        className={cn("search-pop-svg", dragging && "is-dragging")}
        aria-hidden="true"
        onPointerDown={(event) => {
          if (event.button !== 0) return;
          const svg = svgRef.current;
          if (!svg) return;
          const point = svgPoint(svg, event.clientX, event.clientY);
          dragRef.current = {
            pointer: event.pointerId,
            mx: point.x,
            my: point.y,
            vx: viewRef.current.x,
            vy: viewRef.current.y,
          };
          svg.setPointerCapture(event.pointerId);
          setDragging(true);
        }}
        onPointerMove={(event) => {
          const drag = dragRef.current;
          const svg = svgRef.current;
          if (!drag || !svg || event.pointerId !== drag.pointer) return;
          const point = svgPoint(svg, event.clientX, event.clientY);
          viewRef.current = {
            ...viewRef.current,
            x: drag.vx + (point.x - drag.mx),
            y: drag.vy + (point.y - drag.my),
          };
          applyView();
        }}
        onPointerUp={(event) => {
          if (dragRef.current?.pointer === event.pointerId) {
            dragRef.current = null;
            setDragging(false);
          }
        }}
        onPointerCancel={() => {
          dragRef.current = null;
          setDragging(false);
        }}
        onDoubleClick={() => {
          viewRef.current = { x: 0, y: 0, k: 1 };
          applyView();
        }}
      >
        <g ref={groupRef}>
          {edges.map((edge) => (
            <line
              key={`${edge.from.id}->${edge.to.id}`}
              x1={cx + edge.from.x}
              y1={cy + edge.from.y}
              x2={cx + edge.to.x}
              y2={cy + edge.to.y}
              className={cn(
                "search-edge",
                edge.to.live && "is-live",
                edge.to.tried && "is-tried",
              )}
            />
          ))}
          {nodes.map((node) => (
            <g key={node.id} transform={`translate(${cx + node.x} ${cy + node.y})`}>
              {node.current ? (
                <circle r="16" className="search-pulse" />
              ) : null}
              <circle
                r={node.id === "root" ? 12 : 8}
                className={cn(
                  "search-node",
                  node.id === "root" && "is-root",
                  node.current && "is-current",
                  node.live && "is-live",
                  node.tried && "is-tried",
                )}
              />
              <text y={node.id === "root" ? 24 : 20} className="search-label">
                {node.short}
              </text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}
