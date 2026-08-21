import { createGame, isStuck, normalizeFoundations } from "./engine";
import type {
  DealLog,
  GameState,
  MoveLogEntry,
  Settings,
  Snapshot,
  Stats,
} from "./types";

const KEY = "klondike.v1";
const LOGS_KEY = "klondike.logs.v1";
const SAVE_VERSION = 1 as const;

export const defaultSettings: Settings = {
  drawCount: 1,
  sound: true,
};

export const defaultStats: Stats = {
  played: 0,
  won: 0,
  bestTime: null,
  currentStreak: 0,
  bestStreak: 0,
};

export function emptySnapshot(settings: Settings = defaultSettings): Snapshot {
  return {
    version: SAVE_VERSION,
    state: createGame({ drawCount: settings.drawCount }),
    history: [],
    settings,
    stats: { ...defaultStats },
    log: [],
  };
}

function isCard(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  const card = value as { id?: unknown; suit?: unknown; rank?: unknown; faceUp?: unknown };
  return (
    typeof card.id === "string" &&
    typeof card.suit === "string" &&
    typeof card.rank === "number" &&
    typeof card.faceUp === "boolean"
  );
}

function isState(value: unknown): value is GameState {
  if (!value || typeof value !== "object") return false;
  const s = value as GameState;
  return (
    Array.isArray(s.stock) &&
    Array.isArray(s.waste) &&
    Array.isArray(s.foundations) &&
    s.foundations.length === 4 &&
    Array.isArray(s.tableau) &&
    s.tableau.length === 7 &&
    (s.drawCount === 1 || s.drawCount === 3) &&
    typeof s.moves === "number" &&
    typeof s.score === "number" &&
    typeof s.won === "boolean" &&
    typeof s.seed === "number" &&
    s.stock.every(isCard) &&
    s.waste.every(isCard)
  );
}

function isLogEntry(value: unknown): value is MoveLogEntry {
  if (!value || typeof value !== "object") return false;
  const row = value as MoveLogEntry;
  return (
    typeof row.n === "number" &&
    typeof row.at === "number" &&
    (row.actor === "manual" || row.actor === "autoplay") &&
    typeof row.action === "string" &&
    typeof row.label === "string"
  );
}

function normalizeLogEntry(value: unknown): MoveLogEntry | null {
  if (!isLogEntry(value)) return null;
  return {
    ...value,
    hints: Array.isArray(value.hints)
      ? value.hints.filter((item) => typeof item === "string")
      : [],
  };
}

function isDealLog(value: unknown): value is DealLog {
  if (!value || typeof value !== "object") return false;
  const row = value as DealLog;
  return (
    typeof row.dealId === "number" &&
    typeof row.seed === "number" &&
    Array.isArray(row.entries) &&
    row.entries.every((entry) => normalizeLogEntry(entry) !== null)
  );
}

export function loadSnapshot(): Snapshot | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Snapshot>;
    if (parsed.version !== SAVE_VERSION || !parsed.state || !isState(parsed.state)) {
      return null;
    }
    return {
      version: SAVE_VERSION,
      state: normalizeFoundations(parsed.state),
      history: Array.isArray(parsed.history)
        ? parsed.history.filter(isState).map(normalizeFoundations).slice(-40)
        : [],
      settings: {
        drawCount: parsed.settings?.drawCount === 3 ? 3 : 1,
        sound: parsed.settings?.sound !== false,
      },
      stats: { ...defaultStats, ...parsed.stats },
      log: Array.isArray(parsed.log)
        ? parsed.log.map(normalizeLogEntry).filter((row): row is MoveLogEntry => row !== null).slice(-400)
        : [],
    };
  } catch {
    return null;
  }
}

export function saveSnapshot(snapshot: Snapshot): void {
  try {
    const payload: Snapshot = {
      ...snapshot,
      history: snapshot.history.slice(-40),
      log: snapshot.log.slice(-400),
    };
    localStorage.setItem(KEY, JSON.stringify(payload));
  } catch {
    // Private mode / quota — keep playing in memory.
  }
}

export function loadDealLogs(): DealLog[] {
  try {
    const raw = localStorage.getItem(LOGS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isDealLog).slice(0, 20);
  } catch {
    return [];
  }
}

export function saveDealLogs(logs: DealLog[]): void {
  try {
    localStorage.setItem(LOGS_KEY, JSON.stringify(logs.slice(0, 20)));
  } catch {
    // Private mode / quota
  }
}

export function archiveDeal(
  state: GameState,
  entries: MoveLogEntry[],
  extra?: { stuck?: boolean },
): DealLog[] {
  if (entries.length === 0 && state.moves === 0) return loadDealLogs();
  const deal: DealLog = {
    dealId: state.dealId,
    seed: state.seed,
    drawCount: state.drawCount,
    startedAt: state.startedAt,
    finishedAt: state.finishedAt,
    won: state.won,
    stuck: extra?.stuck ?? isStuck(state),
    moves: state.moves,
    score: state.score,
    entries: entries.slice(-400).map((row) => ({
      ...row,
      hints: row.hints ?? [],
    })),
  };
  const next = [deal, ...loadDealLogs().filter((row) => row.dealId !== deal.dealId)].slice(
    0,
    20,
  );
  saveDealLogs(next);
  return next;
}

export function recordWin(stats: Stats, timeSeconds: number): Stats {
  const currentStreak = stats.currentStreak + 1;
  return {
    played: stats.played,
    won: stats.won + 1,
    bestTime:
      stats.bestTime === null ? timeSeconds : Math.min(stats.bestTime, timeSeconds),
    currentStreak,
    bestStreak: Math.max(stats.bestStreak, currentStreak),
  };
}

export function recordLossStreak(stats: Stats): Stats {
  return { ...stats, currentStreak: 0 };
}

export function recordPlayed(stats: Stats, already: boolean): Stats {
  if (already) return stats;
  return { ...stats, played: stats.played + 1 };
}
