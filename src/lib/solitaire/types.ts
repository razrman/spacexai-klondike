export const SUITS = ["spades", "hearts", "diamonds", "clubs"] as const;
export type Suit = (typeof SUITS)[number];

/** Foundations, left to right. */
export const FOUNDATION_SUITS = ["hearts", "clubs", "diamonds", "spades"] as const;

export const RANKS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13] as const;
export type Rank = (typeof RANKS)[number];

export const RANK_LABEL = [
  "",
  "A",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
] as const;

export const SUIT_LABEL: Record<Suit, string> = {
  spades: "Spades",
  hearts: "Hearts",
  diamonds: "Diamonds",
  clubs: "Clubs",
};

export const RANK_NAME: Record<Rank, string> = {
  1: "Ace",
  2: "Two",
  3: "Three",
  4: "Four",
  5: "Five",
  6: "Six",
  7: "Seven",
  8: "Eight",
  9: "Nine",
  10: "Ten",
  11: "Jack",
  12: "Queen",
  13: "King",
};

export type Card = {
  id: string;
  suit: Suit;
  rank: Rank;
  faceUp: boolean;
};

export type Source =
  | { pile: "waste" }
  | { pile: "foundation"; index: number }
  | { pile: "tableau"; index: number; cardIndex: number };

export type Dest =
  | { pile: "foundation"; index: number }
  | { pile: "tableau"; index: number };

export type Move = {
  from: Source;
  to: Dest;
  kind: "foundation" | "reveal" | "waste" | "tableau" | "draw";
};

export type GameState = {
  stock: Card[];
  waste: Card[];
  foundations: [Card[], Card[], Card[], Card[]];
  tableau: [Card[], Card[], Card[], Card[], Card[], Card[], Card[]];
  drawCount: 1 | 3;
  moves: number;
  score: number;
  startedAt: number | null;
  finishedAt: number | null;
  won: boolean;
  seed: number;
  sessionCounted: boolean;
  dealId: number;
  /** Completed trips through the stock (emptied). Draw-3 is limited to two. */
  stockPasses: number;
  /** How many cards from the latest stock flip are still fanned on the waste. */
  wasteFan: number;
};

export type Settings = {
  drawCount: 1 | 3;
  sound: boolean;
};

export type Stats = {
  played: number;
  won: number;
  bestTime: number | null;
  currentStreak: number;
  bestStreak: number;
};

export type Snapshot = {
  version: 1;
  state: GameState;
  history: GameState[];
  settings: Settings;
  stats: Stats;
  log: MoveLogEntry[];
};

export type MoveLogActor = "manual" | "autoplay";

export type MoveLogAction = "move" | "draw" | "redeal" | "undo" | "deal";

export type MoveStep = { from: Source; to: Dest };

export type ComboStep = { combo: [MoveStep, MoveStep] };

export type LogStep = MoveStep | ComboStep | "draw";

export function isComboStep(step: LogStep): step is ComboStep {
  return typeof step === "object" && step !== null && "combo" in step;
}

export function isMoveStep(step: LogStep): step is MoveStep {
  return typeof step === "object" && step !== null && "from" in step;
}

export type MoveLogEntry = {
  n: number;
  at: number;
  actor: MoveLogActor;
  action: MoveLogAction;
  label: string;
  hints: string[];
  step?: LogStep;
  tried?: string[];
  path?: number;
  move?: number;
  choice?: number;
  parentPath?: number;
};

export type DealLog = {
  dealId: number;
  seed: number;
  drawCount: 1 | 3;
  startedAt: number | null;
  finishedAt: number | null;
  won: boolean;
  stuck: boolean;
  moves: number;
  score: number;
  entries: MoveLogEntry[];
};

export function isRed(suit: Suit): boolean {
  return suit === "hearts" || suit === "diamonds";
}

export function cardLabel(card: Card): string {
  return `${RANK_NAME[card.rank]} of ${SUIT_LABEL[card.suit]}`;
}

export function formatTime(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}
