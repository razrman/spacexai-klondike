import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  formatTime,
  type DealLog,
  type MoveLogEntry,
  type Stats,
} from "@/lib/solitaire/types";
import type { DecisionBranch } from "@/lib/solitaire/engine";
import { cn } from "@/lib/utils";

export function WinOverlay({
  time,
  moves,
  score,
  stats,
  onAgain,
  onLog,
}: {
  time: number;
  moves: number;
  score: number;
  stats: Stats;
  onAgain: () => void;
  onLog: () => void;
}) {
  return (
    <div className="overlay" role="dialog" aria-labelledby="win-title">
      <div className="overlay-card win-card">
        <p className="text-xs tracking-[0.2em] text-muted uppercase">Cleared</p>
        <h2
          id="win-title"
          className="font-display text-4xl font-semibold tracking-tight text-cream"
        >
          Klondike
        </h2>
        <dl className="mt-5 grid grid-cols-3 gap-3 text-center">
          <div>
            <dt className="text-xs text-muted">Time</dt>
            <dd className="mt-1 font-display text-xl text-cream tabular-nums">
              {formatTime(time)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Moves</dt>
            <dd className="mt-1 font-display text-xl text-cream tabular-nums">
              {moves}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Score</dt>
            <dd className="mt-1 font-display text-xl text-cream tabular-nums">
              {score}
            </dd>
          </div>
        </dl>
        <p className="mt-4 text-sm text-muted">
          {stats.won} win{stats.won === 1 ? "" : "s"}
          {stats.bestTime !== null ? ` · best ${formatTime(stats.bestTime)}` : ""}
          {stats.currentStreak > 1 ? ` · streak ${stats.currentStreak}` : ""}
        </p>
        <Button className="mt-6 w-full" onClick={onAgain}>
          Play again
        </Button>
        <Button className="mt-3 w-full" variant="outline" onClick={onLog}>
          Move log
        </Button>
      </div>
    </div>
  );
}

export function HelpOverlay({
  stats,
  onClose,
}: {
  stats: Stats;
  onClose: () => void;
}) {
  const rate =
    stats.played > 0 ? Math.round((stats.won / stats.played) * 100) : 0;
  return (
    <div className="overlay" role="dialog" aria-labelledby="help-title">
      <div className="overlay-card">
        <h2
          id="help-title"
          className="font-display text-2xl font-semibold tracking-tight text-cream"
        >
          How to play
        </h2>
        <ul className="mt-4 space-y-2 text-sm leading-relaxed text-cream/80">
          <li>Build four foundations up by suit, Ace through King — hearts, clubs, diamonds, spades from left to right.</li>
          <li>On the table, stack cards down in alternating colors.</li>
          <li>Only a King may fill an empty column.</li>
          <li>Tap the deck to draw. Switch 1 or 3 cards at the top. Draw-one is one pass through the deck; draw-three may recycle twice.</li>
          <li>Drag a card or a face-up run. Tap to send it if there is one clear home.</li>
          <li>
            Keyboard: space draws, U undoes, H hints, A autoplays, L opens the
            move log, N starts a new game.
          </li>
        </ul>
        <dl className="mt-5 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <Stat label="Played" value={stats.played} />
          <Stat label="Won" value={`${stats.won}${stats.played ? ` · ${rate}%` : ""}`} />
          <Stat
            label="Best"
            value={stats.bestTime === null ? "—" : formatTime(stats.bestTime)}
          />
          <Stat label="Streak" value={stats.currentStreak} />
        </dl>
        <Button className="mt-6 w-full" variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-cream/5 px-3 py-2">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mt-0.5 text-cream tabular-nums">{value}</dd>
    </div>
  );
}

export function StuckOverlay({
  canUndo,
  log,
  leftover,
  path,
  onUndo,
  onNew,
  onLog,
  onClose,
  onBranch,
}: {
  canUndo: boolean;
  log: MoveLogEntry[];
  leftover: DecisionBranch[];
  path: number;
  onUndo: () => void;
  onNew: () => void;
  onLog: () => void;
  onClose: () => void;
  onBranch: (path: number, move: number, label: string) => void;
}) {
  const tree = buildDecisionTree(log, leftover, path);
  return (
    <div
      className="overlay"
      role="dialog"
      aria-labelledby="stuck-title"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="overlay-card stuck-card relative">
        <Button
          variant="ghost"
          size="icon-sm"
          className="absolute top-3 right-3"
          aria-label="Close"
          onClick={onClose}
        >
          <X className="size-4" />
        </Button>
        <p className="text-xs tracking-[0.2em] text-muted uppercase">Dead end</p>
        <h2
          id="stuck-title"
          className="font-display text-3xl font-semibold tracking-tight text-cream"
        >
          No Move Available
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-cream/75">
          Autoplay has nothing left. Starred plays were tried. Click another
          choice to start a new path; earlier paths stay in the log.
        </p>
        <DecisionList rows={tree} onBranch={onBranch} />
        <div className="mt-5 flex gap-3">
          <Button className="flex-1" onClick={onClose}>
            Keep playing
          </Button>
          <Button variant="outline" className="flex-1" onClick={onNew}>
            New game
          </Button>
        </div>
        <div className="mt-3 flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            disabled={!canUndo}
            onClick={onUndo}
          >
            Undo
          </Button>
          <Button className="flex-1" variant="outline" onClick={onLog}>
            Move log
          </Button>
        </div>
      </div>
    </div>
  );
}

type Choice = {
  id: string;
  tag: string;
  label: string;
  tried: boolean;
  path: number;
  move: number;
};

type DecisionRow = {
  key: string;
  choices: Choice[];
};

function isFlipLabel(label: string): boolean {
  return /^(Draw \d+|Redeal stock)$/i.test(label.trim());
}

function padMove(n: number): string {
  return String(Math.max(0, n)).padStart(2, "0");
}

function choiceTag(path: number, move: number, choice: number): string {
  return `P${path} M${padMove(move)} C${choice}:`;
}

function parseHintOptions(
  row: MoveLogEntry,
): { label: string; tried: boolean }[] {
  const raw =
    row.hints && row.hints.length > 0 ? row.hints : [`* ${row.label}`];
  const live = row.label.replace(/^\*\s*/, "").trim();
  const tried = new Set<string>();
  const addTried = (value?: string) => {
    const text = value?.replace(/^\*\s*/, "").trim();
    if (text) tried.add(text);
  };
  addTried(live);
  row.tried?.forEach(addTried);
  const map = new Map<string, true>();
  for (const hint of raw) {
    const text = hint.replace(/^\*\s*/, "").trim();
    if (!text) continue;
    if (hint.startsWith("*")) tried.add(text);
    map.set(text, true);
  }
  for (const text of tried) map.set(text, true);
  return [...map.keys()].map((label) => ({
    label,
    tried: tried.has(label),
  }));
}

function firstMoveOnPath(log: MoveLogEntry[], path: number): number | null {
  let min: number | null = null;
  for (const row of log) {
    if (row.action === "undo" || (row.path ?? 1) !== path) continue;
    const move = row.move ?? row.n;
    if (min === null || move < min) min = move;
  }
  return min;
}

function buildDecisionTree(
  log: MoveLogEntry[],
  leftover: DecisionBranch[],
  currentPath: number,
): DecisionRow[] {
  const plays = log.filter((row) => row.action !== "undo");
  const rows: DecisionRow[] = [];
  const seen = new Set<string>();
  for (const row of plays) {
    const path = row.path ?? 1;
    const move = row.move ?? row.n;
    const key = `${path}-${move}`;
    if (seen.has(key)) continue;
    if (row.parentPath && firstMoveOnPath(plays, path) === move) continue;
    const options = parseHintOptions(row).filter(
      (item) => !isFlipLabel(item.label),
    );
    const choseFlip =
      row.action === "draw" ||
      row.action === "redeal" ||
      isFlipLabel(row.label);
    if (choseFlip || options.length <= 1) continue;
    seen.add(key);
    rows.push({
      key,
      choices: options.map((item, i) => ({
        id: `${key}-${i}-${item.label}`,
        tag: choiceTag(path, move, i + 1),
        label: item.label,
        tried: item.tried,
        path,
        move,
      })),
    });
  }
  const rest = leftover.filter((branch) => !isFlipLabel(branch.label));
  if (rest.length > 1) {
    const last = plays
      .filter((row) => (row.path ?? 1) === currentPath)
      .reduce((max, row) => Math.max(max, row.move ?? row.n), 0);
    const move = last + 1;
    rows.push({
      key: `${currentPath}-end`,
      choices: rest.map((branch, i) => ({
        id: `end-${i}-${branch.label}`,
        tag: choiceTag(currentPath, move, i + 1),
        label: branch.label,
        tried: false,
        path: currentPath,
        move: -1,
      })),
    });
  }
  return rows;
}

function DecisionList({
  rows,
  onBranch,
}: {
  rows: DecisionRow[];
  onBranch: (path: number, move: number, label: string) => void;
}) {
  return (
    <div className="d-tree">
      <p className="d-tree-kicker">Decisions</p>
      {rows.length === 0 ? (
        <p className="text-sm text-cream/60">No branches — every ply had a single play.</p>
      ) : (
        <ol className="d-rows">
          {rows.map((row) => (
            <li key={row.key} className="d-row">
              {row.choices.map((choice) =>
                choice.tried ? (
                  <span key={choice.id} className="d-branch is-chosen">
                    <span className="d-code">{choice.tag}</span>
                    <span className="d-mark">*</span>
                    <span>{choice.label}</span>
                  </span>
                ) : (
                  <button
                    key={choice.id}
                    type="button"
                    className="d-branch is-alt"
                    onClick={() =>
                      onBranch(choice.path, choice.move, choice.label)
                    }
                  >
                    <span className="d-code">{choice.tag}</span>
                    <span>{choice.label}</span>
                  </button>
                ),
              )}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

export function ConfirmNew({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="overlay" role="dialog" aria-labelledby="new-title">
      <div className="overlay-card max-w-sm">
        <h2
          id="new-title"
          className="font-display text-2xl font-semibold tracking-tight text-cream"
        >
          New game?
        </h2>
        <p className="mt-2 text-sm text-cream/75">
          This deal still has moves. Starting over will reset the streak if you have already begun.
        </p>
        <div className="mt-6 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onCancel}>
            Keep playing
          </Button>
          <Button className="flex-1" onClick={onConfirm}>
            Deal again
          </Button>
        </div>
      </div>
    </div>
  );
}

export function Toast({ text, className }: { text: string; className?: string }) {
  return (
    <div className={cn("toast", className)} role="status">
      {text}
    </div>
  );
}

function formatLogText(current: MoveLogEntry[], past: DealLog[]): string {
  const lines: string[] = [];
  lines.push("Current deal");
  if (current.length === 0) lines.push("(no moves yet)");
  for (const row of current) {
    lines.push(
      `${choiceTag(row.path ?? 1, row.move ?? row.n, row.choice ?? 1)} [${row.actor}] ${row.label}`,
    );
    if (row.hints?.length) lines.push(`   ${row.hints.join("  ·  ")}`);
  }
  for (const deal of past) {
    lines.push("");
    const result = deal.won ? "won" : deal.stuck ? "stuck" : "in play";
    lines.push(
      `Deal ${deal.dealId} · seed ${deal.seed} · draw ${deal.drawCount} · ${deal.moves} moves · ${result}`,
    );
    for (const row of deal.entries) {
      lines.push(
      `${choiceTag(row.path ?? 1, row.move ?? row.n, row.choice ?? 1)} [${row.actor}] ${row.label}`,
    );
      if (row.hints?.length) lines.push(`   ${row.hints.join("  ·  ")}`);
    }
  }
  return lines.join("\n");
}

export function LogOverlay({
  current,
  past,
  onClose,
}: {
  current: MoveLogEntry[];
  past: DealLog[];
  onClose: () => void;
}) {
  const copy = () => {
    const text = formatLogText(current, past);
    void navigator.clipboard?.writeText(text);
  };

  return (
    <div className="overlay" role="dialog" aria-labelledby="log-title">
      <div className="overlay-card log-card">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs tracking-[0.2em] text-muted uppercase">Analysis</p>
            <h2
              id="log-title"
              className="font-display text-2xl font-semibold tracking-tight text-cream"
            >
              Move log
            </h2>
          </div>
          <Button variant="outline" size="sm" onClick={copy}>
            Copy
          </Button>
        </div>
        <p className="mt-2 text-sm text-cream/70">
          Every play, with the hints that were available. The chosen hint is marked
          with an asterisk.
        </p>
        <div className="log-list mt-4">
          <LogTable rows={current} empty="No moves on this deal yet." />
          {past.map((deal) => (
            <details key={deal.dealId} className="log-past">
              <summary>
                Deal {deal.seed}
                <span>
                  {deal.won ? "Won" : deal.stuck ? "Stuck" : "Saved"} · {deal.moves}{" "}
                  moves · draw {deal.drawCount}
                </span>
              </summary>
              <LogTable rows={deal.entries} empty="Empty log." />
            </details>
          ))}
        </div>
        <Button className="mt-4 w-full" variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
}

function LogTable({
  rows,
  empty,
}: {
  rows: MoveLogEntry[];
  empty: string;
}) {
  if (rows.length === 0) {
    return <p className="px-1 py-3 text-sm text-muted">{empty}</p>;
  }
  return (
    <ol className="log-rows">
      {rows.map((row) => (
        <li key={`${row.n}-${row.at}`} className="log-item">
          <div className="log-row">
            <span className="log-n">
              {choiceTag(row.path ?? 1, row.move ?? row.n, row.choice ?? 1)}
            </span>
            <span className={cn("log-who", row.actor === "autoplay" && "is-auto")}>
              {row.actor === "autoplay" ? "Auto" : "Manual"}
            </span>
            <span className="log-label">{row.label}</span>
          </div>
          {row.hints && row.hints.length > 0 ? (
            <p className="log-hints">
              {row.hints.map((hint, i) => (
                <span
                  key={`${hint}-${i}`}
                  className={cn("log-hint", hint.startsWith("*") && "is-chosen")}
                >
                  {hint}
                </span>
              ))}
            </p>
          ) : null}
        </li>
      ))}
    </ol>
  );
}
