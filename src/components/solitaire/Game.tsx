import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Board,
  fillDragCards,
  useBoardLayout,
  type DragState,
} from "./Board";
import { FallingCards } from "./FallingCards";
import { Hud } from "./Hud";
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
  findFoundationStep,
  findHint,
  hintsForAction,
  isMovable,
  isStuck,
  positionKey,
  sourcesEqual,
  tryMove,
} from "@/lib/solitaire/engine";
import { playSfx, setSoundEnabled, unlockAudio } from "@/lib/solitaire/audio";
import {
  archiveDeal,
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
  MoveLogAction,
  MoveLogActor,
  MoveLogEntry,
  Settings,
  Snapshot,
  Source,
  Stats,
} from "@/lib/solitaire/types";

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

  useEffect(() => {
    const snap = loadSnapshot();
    if (snap) {
      setState(snap.state);
      setHistory(snap.history);
      setSettings(snap.settings);
      setStats(snap.stats);
      setLog(snap.log ?? []);
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
    if (isStuck(state)) {
      setState((s) =>
        s.won || s.finishedAt ? s : { ...s, finishedAt: Date.now() },
      );
      setAutoplay(false);
      return;
    }
    setStuckDismissed(false);
    if (state.finishedAt) {
      setState((s) => (s.finishedAt ? { ...s, finishedAt: null } : s));
    }
  }, [hydrated, state]);

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
    ) => {
      setLog((rows) =>
        [
          ...rows,
          { n: rows.length + 1, at: Date.now(), actor, action, label, hints },
        ].slice(-400),
      );
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
      appendLog(meta.actor, meta.action, meta.label, meta.hints ?? []);
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
        showToast("No Move Available");
        playSfx("illegal");
        return false;
      }
      return true;
    });
  }, [busy, showToast, state]);

  useEffect(() => {
    if (!autoplay) return;
    let cancelled = false;
    let delayId = 0;
    const seen = new Set<string>([positionKey(stateRef.current)]);

    const stop = (exhausted = false) => {
      if (cancelled) return;
      const current = stateRef.current;
      setAutoplay(false);
      setHint(null);
      if (exhausted && isStuck(current)) {
        setState((s) =>
          s.won || s.finishedAt ? s : { ...s, finishedAt: Date.now() },
        );
      }
    };

    const execute = () => {
      if (cancelled) return;
      const current = stateRef.current;
      const step = findAutoplayStep(current, seen);
      if (!step) {
        stop(isStuck(current));
        return;
      }
      const label = describeAction(current, step);
      if (step === "draw") {
        const next = draw(current);
        if (!next) {
          stop(isStuck(current));
          return;
        }
        commitRef.current(next, current.stock.length === 0 ? "flip" : "draw", {
          actor: "autoplay",
          action: current.stock.length === 0 ? "redeal" : "draw",
          label,
          hints: hintsForAction(current, step),
        });
        if (next.won) stop();
        else if (isStuck(next)) stop(true);
        return;
      }
      const next = tryMove(current, step.from, step.to);
      if (!next) {
        stop(isStuck(current));
        return;
      }
      const key = positionKey(next);
      if (seen.has(key)) {
        stop(isStuck(current));
        return;
      }
      seen.add(key);
      const under =
        step.from.pile === "tableau"
          ? current.tableau[step.from.index]![step.from.cardIndex - 1]
          : undefined;
      commitRef.current(next, under && !under.faceUp ? "flip" : "place", {
        actor: "autoplay",
        action: "move",
        label,
        hints: hintsForAction(current, step),
      });
      if (next.won) stop();
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
        stop(isStuck(current));
        return;
      }
      setHint(step);
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
        sound={settings.sound}
        drawCount={settings.drawCount}
        onNew={() => requestNew()}
        onUndo={handleUndo}
        onHint={handleHint}
        onComplete={() => void runComplete()}
        onToggleAutoplay={toggleAutoplay}
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
          onUndo={handleUndo}
          onNew={() => dealNew(settings.drawCount)}
          onLog={() => setShowLog(true)}
          onClose={() => setStuckDismissed(true)}
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
