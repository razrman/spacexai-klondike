import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Board,
  fillDragCards,
  useBoardLayout,
  type DragState,
} from "./Board";
import { FallingCards } from "./FallingCards";
import { Hud } from "./Hud";
import { SearchTree } from "./SearchTree";
import {
  ConfirmNew,
  HelpOverlay,
  LogOverlay,
  StuckOverlay,
  Toast,
  WinOverlay,
} from "./Overlays";
import {
  canAutoComplete,
  cloneState,
  createGame,
  describeAction,
  displayedScore,
  draw,
  elapsedSeconds,
  findAutoMove,
  findAutoplayStep,
  findDfsBranch,
  findFoundationStep,
  findHint,
  hintsForAction,
  isMovable,
  isStuck,
  listDecisionBranches,
  maxPathId,
  playsForPath,
  replayDeal,
  stepFromLabel,
  applyStep,
  positionKey,
  sourcesEqual,
  tryMove,
} from "@/lib/solitaire/engine";
import { playSfx, setSoundEnabled, unlockAudio } from "@/lib/solitaire/audio";
import { isComboStep } from "@/lib/solitaire/types";
import {
  archiveDeal,
  clearTempDataOnce,
  defaultSettings,
  defaultStats,
  loadDealLogs,
  loadSnapshot,
  recordLossStreak,
  recordPlayed,
  recordWin,
  saveSnapshot,
} from "@/lib/solitaire/storage";
import type {
  Dest,
  DealLog,
  GameState,
  LogStep,
  MoveLogAction,
  MoveLogActor,
  MoveLogEntry,
  Settings,
  Snapshot,
  Source,
  Stats,
} from "@/lib/solitaire/types";

function uniqueTried(labels: Array<string | undefined>): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const raw of labels) {
    const label = raw?.replace(/^\*\s*/, "").trim();
    if (!label || seen.has(label)) continue;
    seen.add(label);
    out.push(label);
  }
  return out;
}

function isFlipLabel(label: string): boolean {
  return /^(Draw \d+|Redeal stock)$/i.test(label.trim());
}

function choiceIndex(hints: string[], label: string): number {
  const want = label.replace(/^\*\s*/, "").trim();
  const options = uniqueTried(hints).filter((item) => !isFlipLabel(item));
  const at = options.indexOf(want);
  return at >= 0 ? at + 1 : 1;
}

function destOf(from: Source): Dest | null {
  if (from.pile === "waste") return null;
  if (from.pile === "foundation") return { pile: "foundation", index: from.index };
  return { pile: "tableau", index: from.index };
}

export function Game() {
  const [state, setState] = useState<GameState>(() =>
    createGame({ seed: 1, drawCount: 3 }),
  );
  const [history, setHistory] = useState<GameState[]>([]);
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [stats, setStats] = useState<Stats>(defaultStats);
  const [selected, setSelected] = useState<Source | null>(null);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [hint, setHint] = useState<{ from: Source; to: Dest } | "draw" | null>(
    null,
  );
  const [help, setHelp] = useState(false);
  const [confirmNew, setConfirmNew] = useState<"new" | 1 | 3 | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [autoplay, setAutoplay] = useState(false);
  const [search, setSearch] = useState(false);
  const [log, setLog] = useState<MoveLogEntry[]>([]);
  const [showLog, setShowLog] = useState(false);
  const [pastLogs, setPastLogs] = useState<DealLog[]>([]);
  const [now, setNow] = useState(() => Date.now());
  const [winRecorded, setWinRecorded] = useState(false);
  const boardRef = useRef<HTMLDivElement>(null);
  const layout = useBoardLayout(boardRef);
  const hintTimer = useRef<number>(0);
  const toastTimer = useRef<number>(0);
  const completeRef = useRef(false);
  const [hydrated, setHydrated] = useState(false);
  const [stuckDismissed, setStuckDismissed] = useState(false);
  const pathRef = useRef(1);
  const moveRef = useRef(0);
  const logRef = useRef(log);
  const searchRef = useRef(search);
  const handleBranchRef = useRef<(
    path: number,
    move: number,
    label: string,
    opts?: { keepAuto?: boolean; actor?: MoveLogActor },
  ) => boolean>(() => false);
  logRef.current = log;
  searchRef.current = search;

  useEffect(() => {
    clearTempDataOnce();
    const snap = loadSnapshot();
    if (snap) {
      setState(snap.state);
      setHistory(snap.history);
      setSettings(snap.settings);
      setStats(snap.stats);
      setLog(snap.log ?? []);
      const rows = snap.log ?? [];
      pathRef.current = maxPathId(rows);
      const onPath = rows.filter((row) => (row.path ?? 1) === pathRef.current);
      moveRef.current = onPath.reduce(
        (max, row) => Math.max(max, row.move ?? row.n),
        0,
      );
      setPastLogs(loadDealLogs());
      setWinRecorded(snap.state.won);
      setSoundEnabled(snap.settings.sound);
    }
    setHydrated(true);
  }, []);

  const snapshot: Snapshot = useMemo(
    () => ({ version: 1, state, history, settings, stats, log }),
    [state, history, settings, stats, log],
  );

  useEffect(() => {
    if (!hydrated) return;
    saveSnapshot(snapshot);
  }, [hydrated, snapshot]);

  useEffect(() => {
    if (!hydrated) return;
    const flush = () => saveSnapshot(snapshot);
    const onHide = () => {
      if (document.visibilityState === "hidden") flush();
    };
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", flush);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", flush);
    };
  }, [hydrated, snapshot]);

  useEffect(() => {
    if (!state.startedAt || state.won || state.finishedAt) return;
    let raf = 0;
    const tick = () => {
      const t = Date.now();
      setNow((prev) =>
        Math.floor(prev / 1000) === Math.floor(t / 1000) ? prev : t,
      );
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [state.startedAt, state.won, state.finishedAt]);

  useEffect(() => {
    if (!hydrated || state.won) return;
    if (search && autoplay) return;
    if (isStuck(state)) {
      setState((s) =>
        s.won || s.finishedAt ? s : { ...s, finishedAt: Date.now() },
      );
      if (!search) setAutoplay(false);
      return;
    }
    setStuckDismissed(false);
    if (state.finishedAt) {
      setState((s) => (s.finishedAt ? { ...s, finishedAt: null } : s));
    }
  }, [autoplay, hydrated, search, state]);

  const showToast = useCallback((text: string) => {
    setToast(text);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 1800);
  }, []);

  const appendLog = useCallback(
    (
      actor: MoveLogActor,
      action: MoveLogAction,
      label: string,
      hints: string[] = [],
      step?: LogStep,
    ) => {
      setLog((rows) => {
        moveRef.current += 1;
        const path = pathRef.current;
        const move = moveRef.current;
        const choice = choiceIndex(hints, label);
        return [
          ...rows,
          {
            n: rows.length + 1,
            at: Date.now(),
            actor,
            action,
            label,
            hints,
            step,
            tried: [label],
            path,
            move,
            choice,
          },
        ].slice(searchRef.current ? -4000 : -800);
      });
    },
    [],
  );

  const commit = useCallback(
    (
      next: GameState,
      sfx: "draw" | "place" | "flip" | "deal" | undefined,
      meta: {
        actor: MoveLogActor;
        action: MoveLogAction;
        label: string;
        hints?: string[];
        step?: LogStep;
      },
    ) => {
      setHistory((h) => [...h.slice(-39), cloneState(state)]);
      if (next.sessionCounted && !state.sessionCounted) {
        setStats((s) => recordPlayed(s, false));
      }
      if (next.won && !state.won && !winRecorded) {
        setStats((s) => recordWin(s, elapsedSeconds(next)));
        setWinRecorded(true);
        playSfx("win");
      } else if (sfx) {
        playSfx(sfx);
      }
      setState(next);
      setSelected(null);
      setHint(null);
      appendLog(meta.actor, meta.action, meta.label, meta.hints ?? [], meta.step);
    },
    [appendLog, state, winRecorded],
  );

  const stateRef = useRef(state);
  const commitRef = useRef(commit);
  stateRef.current = state;
  commitRef.current = commit;

  const dealNew = useCallback(
    (drawCount: 1 | 3) => {
      if (state.sessionCounted && !state.won) {
        setStats((s) => recordLossStreak(s));
      }
      setPastLogs(archiveDeal(state, log, { stuck: !state.won && isStuck(state) }));
      setState(
        createGame({
          drawCount,
          dealId: Date.now(),
        }),
      );
      setHistory([]);
      setLog([]);
      pathRef.current = 1;
      moveRef.current = 0;
      setSelected(null);
      setHint(null);
      setWinRecorded(false);
      setConfirmNew(null);
      setAutoplay(false);
      playSfx("deal");
    },
    [log, state],
  );

  const requestNew = useCallback(
    (drawCount?: 1 | 3) => {
      unlockAudio();
      setAutoplay(false);
      const nextDraw = drawCount ?? settings.drawCount;
      if (state.moves > 0 && !state.won && !isStuck(state)) {
        setConfirmNew(drawCount ?? "new");
        return;
      }
      if (drawCount) {
        setSettings((s) => ({ ...s, drawCount }));
      }
      dealNew(nextDraw);
    },
    [dealNew, settings.drawCount, state],
  );

  const handleDraw = useCallback(() => {
    if (busy || autoplay) return;
    unlockAudio();
    const next = draw(state, {
      ignorePassLimit: stuckDismissed || isStuck(state),
    });
    if (!next) {
      playSfx("illegal");
      if (isStuck(state)) {
        setState((s) =>
          s.finishedAt ? s : { ...s, finishedAt: Date.now() },
        );
        setAutoplay(false);
      }
      return;
    }
    commit(next, state.stock.length === 0 ? "flip" : "draw", {
      actor: "manual",
      action: state.stock.length === 0 ? "redeal" : "draw",
      label: describeAction(state, "draw"),
      hints: hintsForAction(state, "draw"),
      step: "draw",
    });
  }, [autoplay, busy, commit, state, stuckDismissed]);

  const handleMove = useCallback(
    (from: Source, to: Dest, quiet = false): boolean => {
      if (busy || autoplay) return false;
      unlockAudio();
      const next = tryMove(state, from, to);
      if (!next) {
        if (!quiet) playSfx("illegal");
        return false;
      }
      const flipped =
        from.pile === "tableau" &&
        state.tableau[from.index]![from.cardIndex - 1] &&
        !state.tableau[from.index]![from.cardIndex - 1]!.faceUp;
      commit(next, flipped ? "flip" : "place", {
        actor: "manual",
        action: "move",
        label: describeAction(state, { from, to }),
        hints: hintsForAction(state, { from, to }),
        step: { from, to },
      });
      return true;
    },
    [autoplay, busy, commit, state],
  );

  const handleActivate = useCallback(
    (from: Source) => {
      if (busy || autoplay) return;
      unlockAudio();
      if (selected) {
        const onto = destOf(from);
        if (onto && handleMove(selected, onto, true)) return;
      }
      const auto = findAutoMove(state, from);
      if (auto && handleMove(from, auto, true)) return;
      if (isMovable(state, from)) {
        setSelected((prev) => (sourcesEqual(prev, from) ? null : from));
      }
    },
    [autoplay, busy, handleMove, selected, state],
  );

  const handleSlot = useCallback(
    (to: Dest) => {
      if (busy || autoplay || !selected) return;
      handleMove(selected, to);
    },
    [autoplay, busy, handleMove, selected],
  );

  const handleBranch = useCallback(
    (
      path: number,
      move: number,
      label: string,
      opts?: { keepAuto?: boolean; actor?: MoveLogActor },
    ): boolean => {
      unlockAudio();
      if (!opts?.keepAuto) setAutoplay(false);
      const origin = createGame({
        seed: state.seed,
        drawCount: state.drawCount,
        dealId: state.dealId,
      });
      const lineage =
        move < 0
          ? playsForPath(log, path)
          : playsForPath(log, path).filter(
              (row) => (row.move ?? row.n) < move,
            );
      const before =
        move < 0 ? cloneState(state) : replayDeal(origin, lineage);
      if (!before) {
        playSfx("illegal");
        return false;
      }
      const step = stepFromLabel(before, label);
      if (!step) {
        playSfx("illegal");
        return false;
      }
      const next = applyStep(before, step);
      if (!next) {
        playSfx("illegal");
        return false;
      }
      const prior = log.find(
        (row) =>
          row.action !== "undo" &&
          (row.path ?? 1) === path &&
          (row.move ?? row.n) === move,
      );
      const tried = uniqueTried([
        ...(prior?.tried ?? []),
        prior?.label,
        label,
        ...(prior?.hints ?? []).filter((hint) => hint.startsWith("*")),
      ]);
      const options = uniqueTried([
        ...(prior?.hints ?? []).map((hint) => hint.replace(/^\*\s*/, "")),
        ...hintsForAction(before, step).map((hint) =>
          hint.replace(/^\*\s*/, ""),
        ),
      ]);
      const hints = options.map((item) =>
        tried.includes(item) ? `* ${item}` : item,
      );
      const action: MoveLogAction =
        step === "draw"
          ? before.stock.length === 0
            ? "redeal"
            : "draw"
          : "move";
      const newPath = maxPathId(log) + 1;
      const branchMove = move < 0 ? moveRef.current + 1 : move;
      const choice = choiceIndex(hints, label);
      pathRef.current = newPath;
      moveRef.current = branchMove;
      const row: MoveLogEntry = {
        n: log.length + 1,
        at: Date.now(),
        actor: opts?.actor ?? "manual",
        action,
        label: describeAction(before, step),
        hints,
        step,
        tried,
        path: newPath,
        move: branchMove,
        choice,
        parentPath: path,
      };
      setHistory([cloneState(before)]);
      setLog((rows) => {
        const updated = rows.map((item) => {
          if (
            item.action === "undo" ||
            (item.path ?? 1) !== path ||
            (item.move ?? item.n) !== move
          ) {
            return item;
          }
          return { ...item, tried, hints };
        });
        return [...updated, { ...row, n: updated.length + 1 }];
      });
      setSelected(null);
      setHint(null);
      setStuckDismissed(false);
      setWinRecorded(Boolean(next.won));
      setState({
        ...next,
        finishedAt: next.won ? next.finishedAt ?? Date.now() : null,
      });
      playSfx(
        step === "draw"
          ? before.stock.length === 0
            ? "flip"
            : "draw"
          : "place",
      );
      return true;
    },
    [log, state],
  );
  handleBranchRef.current = handleBranch;

  const handleUndo = useCallback(() => {
    setAutoplay(false);
    if (busy || history.length === 0 || state.won) return;
    unlockAudio();
    const prev = history[history.length - 1]!;
    setHistory((h) => h.slice(0, -1));
    setState(prev);
    setSelected(null);
    setHint(null);
    appendLog("manual", "undo", "Undo");
    playSfx("flip");
  }, [appendLog, busy, history, state.won]);

  const handleHint = useCallback(() => {
    if (autoplay) return;
    unlockAudio();
    const next = findHint(state);
    if (!next) {
      showToast("No Move Available");
      playSfx("illegal");
      return;
    }
    setHint(next);
    window.clearTimeout(hintTimer.current);
    hintTimer.current = window.setTimeout(() => setHint(null), 1600);
  }, [autoplay, showToast, state]);

  const toggleAutoplay = useCallback(() => {
    unlockAudio();
    if (state.won || busy) return;
    setAutoplay((on) => {
      if (on) return false;
      if (isStuck(state)) {
        if (search) {
          const fork = findDfsBranch(log, pathRef.current, state);
          if (fork) {
            return handleBranch(fork.path, fork.move, fork.label, {
              keepAuto: true,
              actor: "autoplay",
            });
          }
          showToast("No winning path");
          playSfx("illegal");
          return false;
        }
        showToast("No Move Available");
        playSfx("illegal");
        return false;
      }
      return true;
    });
  }, [busy, handleBranch, log, search, showToast, state]);

  useEffect(() => {
    if (!autoplay) return;
    let cancelled = false;
    let delayId = 0;
    let forking = false;
    const seen = new Set<string>([positionKey(stateRef.current)]);

    const stop = (exhausted = false) => {
      if (cancelled || forking) return;
      forking = true;
      const current = stateRef.current;
      if (exhausted && searchRef.current && !current.won) {
        if (maxPathId(logRef.current) >= 80) {
          setAutoplay(false);
          setHint(null);
          showToast("Search limit reached");
          setState((s) =>
            s.won || s.finishedAt ? s : { ...s, finishedAt: Date.now() },
          );
          forking = false;
          return;
        }
        const skip = new Set<string>();
        for (let n = 0; n < 40; n++) {
          const fork = findDfsBranch(
            logRef.current,
            pathRef.current,
            current,
            seen,
            skip,
          );
          if (!fork) break;
          skip.add(`${fork.path}:${fork.move}:${fork.label}`);
          const ok = handleBranchRef.current(fork.path, fork.move, fork.label, {
            keepAuto: true,
            actor: "autoplay",
          });
          if (ok) {
            seen.add(positionKey(stateRef.current));
            forking = false;
            return;
          }
        }
        setAutoplay(false);
        setHint(null);
        showToast("No winning path");
        setState((s) =>
          s.won || s.finishedAt ? s : { ...s, finishedAt: Date.now() },
        );
        forking = false;
        return;
      }
      setAutoplay(false);
      setHint(null);
      if (exhausted && isStuck(current)) {
        setState((s) =>
          s.won || s.finishedAt ? s : { ...s, finishedAt: Date.now() },
        );
      }
      forking = false;
    };

    const execute = () => {
      if (cancelled) return;
      const current = stateRef.current;
      const step = findAutoplayStep(current, seen);
      if (!step) {
        stop(Boolean(searchRef.current) || isStuck(current));
        return;
      }
      const label = describeAction(current, step);
      if (step === "draw") {
        const next = draw(current);
        if (!next) {
          stop(Boolean(searchRef.current) || isStuck(current));
          return;
        }
        commitRef.current(next, current.stock.length === 0 ? "flip" : "draw", {
          actor: "autoplay",
          action: current.stock.length === 0 ? "redeal" : "draw",
          label,
          hints: hintsForAction(current, step),
          step,
        });
        if (next.won) {
          if (searchRef.current) showToast("Winning path found");
          stop();
        }
        else if (isStuck(next)) stop(true);
        return;
      }
      const next = applyStep(current, step);
      if (!next) {
        stop(Boolean(searchRef.current) || isStuck(current));
        return;
      }
      const key = positionKey(next);
      if (seen.has(key)) {
        stop(Boolean(searchRef.current) || isStuck(current));
        return;
      }
      seen.add(key);
      const head = isComboStep(step) ? step.combo[1] : step;
      const under =
        head.from.pile === "tableau"
          ? current.tableau[head.from.index]![head.from.cardIndex - 1]
          : undefined;
      commitRef.current(next, under && !under.faceUp || isComboStep(step) ? "flip" : "place", {
        actor: "autoplay",
        action: "move",
        label,
        hints: hintsForAction(current, step),
        step,
      });
      if (next.won) {
        if (searchRef.current) showToast("Winning path found");
        stop();
      }
      else if (isStuck(next)) stop(true);
    };

    const pulse = () => {
      if (cancelled) return;
      window.clearTimeout(delayId);
      const current = stateRef.current;
      if (current.won) {
        stop();
        return;
      }
      if (isStuck(current)) {
        stop(true);
        return;
      }
      const step = findAutoplayStep(current, seen);
      if (!step) {
        stop(Boolean(searchRef.current) || isStuck(current));
        return;
      }
      setHint(
        step === "draw" || !isComboStep(step) ? step : step.combo[0],
      );
      delayId = window.setTimeout(execute, 280);
    };

    pulse();
    const intervalId = window.setInterval(pulse, 500);
    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      window.clearTimeout(delayId);
    };
  }, [autoplay]);

  const runComplete = useCallback(async () => {
    if (busy || autoplay || completeRef.current) return;
    completeRef.current = true;
    setBusy(true);
    setSelected(null);
    let cursor = state;
    let guard = 0;
    while (guard < 64) {
      const step = findFoundationStep(cursor);
      if (!step) break;
      const label = describeAction(cursor, { from: step.from, to: step.to });
      const hints = hintsForAction(cursor, { from: step.from, to: step.to });
      const next = tryMove(cursor, step.from, step.to);
      if (!next) break;
      cursor = next;
      setState(next);
      appendLog("manual", "move", `${label} (finish)`, hints);
      playSfx("place");
      guard += 1;
      await new Promise((r) => setTimeout(r, 70));
    }
    if (cursor.won && !state.won) {
      setHistory((h) => [...h.slice(-39), cloneState(state)]);
      setStats((s) => recordWin(s, elapsedSeconds(cursor)));
      setWinRecorded(true);
      playSfx("win");
    }
    setBusy(false);
    completeRef.current = false;
  }, [appendLog, autoplay, busy, state]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const tag = (event.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (event.key === " " || event.code === "Space") {
        event.preventDefault();
        handleDraw();
      } else if (event.key === "u" || event.key === "U") {
        handleUndo();
      } else if (event.key === "h" || event.key === "H") {
        handleHint();
      } else if (event.key === "a" || event.key === "A") {
        event.preventDefault();
        toggleAutoplay();
      } else if (event.key === "l" || event.key === "L") {
        setShowLog((open) => !open);
      } else if (event.key === "n" || event.key === "N") {
        requestNew();
      } else if (event.key === "Escape") {
        setSelected(null);
        setHelp(false);
        setShowLog(false);
        setConfirmNew(null);
        setAutoplay(false);
        setStuckDismissed(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleDraw, handleHint, handleUndo, requestNew, toggleAutoplay]);

  const filledDrag = fillDragCards(state, drag);
  const time = elapsedSeconds(state, now);
  const score = displayedScore(state, now);
  const finishable = canAutoComplete(state);
  const stuck = !busy && !autoplay && !state.won && isStuck(state);
  const showStuck = stuck && !stuckDismissed;

  return (
    <div
      className="table-shell"
      onPointerDown={unlockAudio}
    >
      <Hud
        time={time}
        moves={state.moves}
        score={score}
        canUndo={history.length > 0 && !state.won && !autoplay}
        canComplete={finishable && !busy && !autoplay}
        autoplay={autoplay}
        search={search}
        sound={settings.sound}
        drawCount={settings.drawCount}
        onNew={() => requestNew()}
        onUndo={handleUndo}
        onHint={handleHint}
        onComplete={() => void runComplete()}
        onToggleAutoplay={toggleAutoplay}
        onSearch={(on) => {
          unlockAudio();
          setSearch(on);
        }}
        onToggleSound={() => {
          unlockAudio();
          setSettings((s) => {
            const sound = !s.sound;
            setSoundEnabled(sound);
            return { ...s, sound };
          });
        }}
        onDrawCount={(n) => {
          if (n === settings.drawCount) return;
          requestNew(n);
        }}
        onHelp={() => setHelp(true)}
        onLog={() => setShowLog(true)}
      />
      <main className="table-main">
        {search && autoplay ? (
          <SearchTree
            log={log}
            path={maxPathId(log)}
            seed={state.seed}
            drawCount={state.drawCount}
            dealId={state.dealId}
          />
        ) : null}
        <div ref={boardRef} className="h-full w-full">
        <Board
          state={state}
          selected={selected}
          hint={hint}
          drag={filledDrag}
          layout={layout}
          busy={busy || autoplay}
          freeStock={stuckDismissed || stuck}
          onDraw={handleDraw}
          onActivate={handleActivate}
          onDrop={handleMove}
          onSlot={handleSlot}
          onDragChange={setDrag}
        />
        </div>
      </main>
      {toast ? <Toast text={toast} /> : null}
      {help ? (
        <HelpOverlay stats={stats} onClose={() => setHelp(false)} />
      ) : null}
      {confirmNew ? (
        <ConfirmNew
          onCancel={() => setConfirmNew(null)}
          onConfirm={() => {
            const n =
              confirmNew === 1 || confirmNew === 3
                ? confirmNew
                : settings.drawCount;
            setSettings((s) => ({ ...s, drawCount: n }));
            dealNew(n);
          }}
        />
      ) : null}
      {state.won ? (
        <>
          <FallingCards layer="win" />
          <WinOverlay
            time={time}
            moves={state.moves}
            score={state.score}
            stats={stats}
            onAgain={() => dealNew(settings.drawCount)}
            onLog={() => setShowLog(true)}
          />
        </>
      ) : showStuck ? (
        <StuckOverlay
          canUndo={history.length > 0}
          log={log}
          leftover={listDecisionBranches(state)}
          path={maxPathId(log)}
          onUndo={handleUndo}
          onNew={() => dealNew(settings.drawCount)}
          onLog={() => setShowLog(true)}
          onClose={() => setStuckDismissed(true)}
          onBranch={handleBranch}
        />
      ) : null}
      {showLog ? (
        <LogOverlay
          current={log}
          past={pastLogs.filter((row) => row.dealId !== state.dealId)}
          onClose={() => setShowLog(false)}
        />
      ) : null}
    </div>
  );
}
