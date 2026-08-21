import {
  type Card,
  type Dest,
  type GameState,
  type Move,
  type Rank,
  type Source,
  type Suit,
  FOUNDATION_SUITS,
  isRed,
  RANK_LABEL,
  RANKS,
  SUITS,
} from "./types";

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function cloneCard(card: Card): Card {
  return { ...card };
}

export function cloneState(state: GameState): GameState {
  return {
    ...state,
    stock: state.stock.map(cloneCard),
    waste: state.waste.map(cloneCard),
    foundations: [
      state.foundations[0].map(cloneCard),
      state.foundations[1].map(cloneCard),
      state.foundations[2].map(cloneCard),
      state.foundations[3].map(cloneCard),
    ],
    tableau: [
      state.tableau[0].map(cloneCard),
      state.tableau[1].map(cloneCard),
      state.tableau[2].map(cloneCard),
      state.tableau[3].map(cloneCard),
      state.tableau[4].map(cloneCard),
      state.tableau[5].map(cloneCard),
      state.tableau[6].map(cloneCard),
    ],
  };
}

function makeDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({
        id: `${suit}-${rank}`,
        suit,
        rank: rank as Rank,
        faceUp: false,
      });
    }
  }
  return deck;
}

function shuffle<T>(items: T[], rng: () => number): T[] {
  const arr = items.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = arr[i]!;
    arr[i] = arr[j]!;
    arr[j] = tmp;
  }
  return arr;
}

export function createGame(opts?: {
  seed?: number;
  drawCount?: 1 | 3;
  dealId?: number;
}): GameState {
  const seed = opts?.seed ?? (Math.floor(Math.random() * 0xffffffff) || 1);
  const drawCount = opts?.drawCount ?? 3;
  const rng = mulberry32(seed);
  const deck = shuffle(makeDeck(), rng);

  const tableau: GameState["tableau"] = [[], [], [], [], [], [], []];
  for (let col = 0; col < 7; col++) {
    for (let n = 0; n <= col; n++) {
      const card = deck.pop();
      if (!card) throw new Error("Deck underflow while dealing");
      tableau[col]!.push({ ...card, faceUp: n === col });
    }
  }

  return {
    stock: deck.map((card) => ({ ...card, faceUp: false })),
    waste: [],
    foundations: [[], [], [], []],
    tableau,
    drawCount,
    moves: 0,
    score: 0,
    startedAt: null,
    finishedAt: null,
    won: false,
    seed,
    sessionCounted: false,
    dealId: opts?.dealId ?? seed,
    stockPasses: 0,
    wasteFan: 0,
  };
}

function topOf(pile: Card[]): Card | undefined {
  return pile[pile.length - 1];
}

export function canPlaceOnTableau(card: Card, destTop: Card | undefined): boolean {
  if (!destTop) return card.rank === 13;
  if (card.rank === 1) return false;
  return destTop.rank === card.rank + 1 && isRed(destTop.suit) !== isRed(card.suit);
}

export function canPlaceOnFoundation(
  card: Card,
  destTop: Card | undefined,
  suit: Suit,
): boolean {
  if (card.suit !== suit) return false;
  if (!destTop) return card.rank === 1;
  return destTop.suit === card.suit && destTop.rank + 1 === card.rank;
}

export function foundationSuit(index: number): Suit {
  return FOUNDATION_SUITS[index] ?? FOUNDATION_SUITS[0];
}

export function normalizeFoundations(state: GameState): GameState {
  const next: GameState["foundations"] = [[], [], [], []];
  for (const pile of state.foundations) {
    const card = pile[pile.length - 1];
    if (!card) continue;
    const index = FOUNDATION_SUITS.indexOf(card.suit);
    if (index < 0 || next[index]!.length > 0) continue;
    next[index] = pile.map(cloneCard);
  }
  const wasteFan = Math.max(
    0,
    Math.min(state.wasteFan ?? Math.min(3, state.waste.length), state.waste.length),
  );
  return { ...state, foundations: next, wasteFan };
}

function isValidRun(cards: Card[]): boolean {
  if (cards.length === 0) return false;
  for (let i = 0; i < cards.length; i++) {
    const card = cards[i]!;
    if (!card.faceUp) return false;
    if (i === 0) continue;
    const prev = cards[i - 1]!;
    if (prev.rank !== card.rank + 1) return false;
    if (isRed(prev.suit) === isRed(card.suit)) return false;
  }
  return true;
}

export function getSourceCards(state: GameState, from: Source): Card[] | null {
  if (from.pile === "waste") {
    const card = topOf(state.waste);
    return card ? [card] : null;
  }
  if (from.pile === "foundation") {
    const card = topOf(state.foundations[from.index] ?? []);
    return card ? [card] : null;
  }
  const col = state.tableau[from.index];
  if (!col || from.cardIndex < 0 || from.cardIndex >= col.length) return null;
  const run = col.slice(from.cardIndex);
  return isValidRun(run) ? run : null;
}

export function isMovable(state: GameState, from: Source): boolean {
  return getSourceCards(state, from) !== null;
}

function bumpClock(state: GameState): GameState {
  if (state.startedAt !== null || state.won) return state;
  return { ...state, startedAt: Date.now() };
}

function addScore(state: GameState, delta: number): GameState {
  return { ...state, score: Math.max(0, state.score + delta) };
}

function removeFromSource(state: GameState, from: Source, count: number): GameState {
  const next = cloneState(state);
  if (from.pile === "waste") {
    next.waste.splice(next.waste.length - count, count);
    next.wasteFan = Math.max(0, (state.wasteFan ?? 0) - count);
    return next;
  }
  if (from.pile === "foundation") {
    next.foundations[from.index]!.splice(
      next.foundations[from.index]!.length - count,
      count,
    );
    return next;
  }
  const col = next.tableau[from.index]!;
  col.splice(from.cardIndex, count);
  const revealed = topOf(col);
  if (revealed && !revealed.faceUp) {
    revealed.faceUp = true;
    return addScore(next, 5);
  }
  return next;
}

function appendToDest(state: GameState, to: Dest, cards: Card[]): GameState {
  const next = cloneState(state);
  const faceUp = cards.map((card) => ({ ...card, faceUp: true }));
  if (to.pile === "foundation") {
    next.foundations[to.index]!.push(...faceUp);
  } else {
    next.tableau[to.index]!.push(...faceUp);
  }
  return next;
}

function destTop(state: GameState, to: Dest): Card | undefined {
  if (to.pile === "foundation") return topOf(state.foundations[to.index] ?? []);
  return topOf(state.tableau[to.index] ?? []);
}

function samePile(from: Source, to: Dest): boolean {
  if (from.pile === "tableau" && to.pile === "tableau") {
    return from.index === to.index;
  }
  if (from.pile === "foundation" && to.pile === "foundation") {
    return from.index === to.index;
  }
  return false;
}

function scoreForMove(from: Source, to: Dest): number {
  if (to.pile === "foundation") {
    if (from.pile === "waste") return 10;
    if (from.pile === "tableau") return 10;
    return 0;
  }
  if (from.pile === "waste") return 5;
  if (from.pile === "foundation") return -15;
  return 0;
}

export function isWon(state: GameState): boolean {
  return state.foundations.every((pile) => pile.length === 13);
}

function markWin(state: GameState): GameState {
  if (state.won || !isWon(state)) return state;
  const now = Date.now();
  const elapsed = state.startedAt ? Math.floor((now - state.startedAt) / 1000) : 0;
  const timePenalty = Math.floor(elapsed / 10) * 2;
  const bonus = Math.max(0, 5000 - elapsed * 5);
  return {
    ...state,
    won: true,
    finishedAt: now,
    score: Math.max(0, state.score - timePenalty) + bonus,
  };
}

export function tryMove(
  state: GameState,
  from: Source,
  to: Dest,
): GameState | null {
  if (state.won) return null;
  if (samePile(from, to)) return null;
  const cards = getSourceCards(state, from);
  if (!cards) return null;
  const attaching = cards[0]!;
  if (to.pile === "foundation") {
    if (cards.length !== 1) return null;
    if (!canPlaceOnFoundation(attaching, destTop(state, to), foundationSuit(to.index))) return null;
  } else if (!canPlaceOnTableau(attaching, destTop(state, to))) {
    return null;
  }

  let next = bumpClock(state);
  next = addScore(next, scoreForMove(from, to));
  next = removeFromSource(next, from, cards.length);
  next = appendToDest(next, to, cards);
  const revealedUnder =
    from.pile === "tableau" &&
    from.cardIndex > 0 &&
    Boolean(state.tableau[from.index]![from.cardIndex - 1]) &&
    !state.tableau[from.index]![from.cardIndex - 1]!.faceUp;
  const progressed = to.pile === "foundation" || revealedUnder;
  next = {
    ...next,
    moves: next.moves + 1,
    sessionCounted: true,
    stockPasses: progressed ? 0 : (state.stockPasses ?? 0),
  };
  return markWin(next);
}

export function draw(
  state: GameState,
  opts?: { ignorePassLimit?: boolean },
): GameState | null {
  if (state.won) return null;
  if (state.stock.length === 0 && state.waste.length === 0) return null;

  const passes = state.stockPasses ?? 0;
  let next = bumpClock(state);
  next = { ...next, moves: next.moves + 1, sessionCounted: true };

  if (next.stock.length === 0) {
    if (!opts?.ignorePassLimit) {
      if (next.drawCount === 1) return null;
      if (passes >= 2) return null;
    }
    const recycled = next.waste
      .map((card) => ({ ...card, faceUp: false }))
      .reverse();
    const penalty = -20;
    next = addScore(
      { ...next, stock: recycled, waste: [], wasteFan: 0 },
      penalty,
    );
    return next;
  }

  const take = Math.min(next.drawCount, next.stock.length);
  const drawn: Card[] = [];
  const stock = next.stock.slice();
  for (let i = 0; i < take; i++) {
    const card = stock.pop();
    if (!card) break;
    drawn.push({ ...card, faceUp: true });
  }
  const stockPasses = stock.length === 0 ? passes + 1 : passes;
  return {
    ...next,
    stock,
    waste: [...next.waste, ...drawn],
    stockPasses,
    wasteFan: drawn.length,
  };
}

export function findAutoMove(state: GameState, from: Source): Dest | null {
  const cards = getSourceCards(state, from);
  if (!cards) return null;
  const attaching = cards[0]!;

  if (cards.length === 1) {
    for (let i = 0; i < 4; i++) {
      if (canPlaceOnFoundation(attaching, topOf(state.foundations[i]!), foundationSuit(i))) {
        return { pile: "foundation", index: i };
      }
    }
  }

  const tableauHits: number[] = [];
  for (let i = 0; i < 7; i++) {
    if (from.pile === "tableau" && from.index === i) continue;
    if (canPlaceOnTableau(attaching, topOf(state.tableau[i]!))) {
      tableauHits.push(i);
    }
  }
  if (tableauHits.length === 1) {
    return { pile: "tableau", index: tableauHits[0]! };
  }
  return null;
}

function pointlessKingShift(state: GameState, from: Source, to: Dest): boolean {
  if (from.pile !== "tableau" || to.pile !== "tableau") return false;
  if (state.tableau[to.index]!.length > 0) return false;
  if (from.cardIndex !== 0) return false;
  const cards = getSourceCards(state, from);
  return Boolean(cards && cards[0]?.rank === 13);
}

export function listLegalMoves(state: GameState): Move[] {
  const moves: Move[] = [];

  const consider = (from: Source, to: Dest) => {
    if (!tryMove(state, from, to)) return;
    const cards = getSourceCards(state, from);
    if (!cards) return;
    if (pointlessKingShift(state, from, to)) return;
    let kind: Move["kind"] = "tableau";
    if (to.pile === "foundation") kind = "foundation";
    else if (from.pile === "waste") kind = "waste";
    else if (
      from.pile === "tableau" &&
      from.cardIndex > 0 &&
      !state.tableau[from.index]![from.cardIndex - 1]!.faceUp
    ) {
      kind = "reveal";
    }
    moves.push({ from, to, kind });
  };

  if (state.waste.length > 0) {
    const from: Source = { pile: "waste" };
    for (let i = 0; i < 4; i++) consider(from, { pile: "foundation", index: i });
    for (let i = 0; i < 7; i++) consider(from, { pile: "tableau", index: i });
  }

  for (let f = 0; f < 4; f++) {
    if (state.foundations[f]!.length === 0) continue;
    const from: Source = { pile: "foundation", index: f };
    for (let i = 0; i < 7; i++) consider(from, { pile: "tableau", index: i });
  }

  for (let col = 0; col < 7; col++) {
    const pile = state.tableau[col]!;
    for (let cardIndex = 0; cardIndex < pile.length; cardIndex++) {
      if (!pile[cardIndex]!.faceUp) continue;
      const from: Source = { pile: "tableau", index: col, cardIndex };
      if (!getSourceCards(state, from)) continue;
      for (let i = 0; i < 4; i++) consider(from, { pile: "foundation", index: i });
      for (let i = 0; i < 7; i++) consider(from, { pile: "tableau", index: i });
    }
  }

  return moves;
}

function canGoToFoundation(state: GameState, card: Card): boolean {
  for (let i = 0; i < 4; i++) {
    if (canPlaceOnFoundation(card, topOf(state.foundations[i]!), foundationSuit(i))) {
      return true;
    }
  }
  return false;
}

function cardIsPlayable(state: GameState, card: Card, skipCol: number): boolean {
  if (canGoToFoundation(state, card)) return true;
  const home = state.tableau[skipCol] ?? [];
  const homeIndex = home.findIndex((item) => item.id === card.id);
  const kingCoversHidden =
    card.rank === 13 &&
    homeIndex > 0 &&
    home.slice(0, homeIndex).some((item) => !item.faceUp);
  for (let i = 0; i < 7; i++) {
    if (i === skipCol) continue;
    const dest = topOf(state.tableau[i]!);
    if (!dest) {
      if (kingCoversHidden) return true;
      continue;
    }
    if (canPlaceOnTableau(card, dest)) return true;
  }
  return false;
}

function isKingStackWithoutHidden(state: GameState, move: Move): boolean {
  if (move.from.pile !== "tableau") return false;
  const cards = getSourceCards(state, move.from);
  if (!cards?.[0] || cards[0].rank !== 13) return false;
  if (move.from.cardIndex <= 0) return true;
  const under = state.tableau[move.from.index]![move.from.cardIndex - 1];
  return !under || under.faceUp;
}

/** Substack move only if the face-up card it uncovers has a play. */
function exposesPlayableVisible(state: GameState, move: Move): boolean {
  if (move.from.pile !== "tableau" || move.to.pile !== "tableau") return false;
  if (move.from.cardIndex <= 0) return false;
  const under = state.tableau[move.from.index]![move.from.cardIndex - 1];
  if (!under?.faceUp) return false;
  const next = tryMove(state, move.from, move.to);
  if (!next) return false;
  const exposed = topOf(next.tableau[move.from.index]!);
  if (!exposed || exposed.id !== under.id) return false;
  return cardIsPlayable(next, exposed, move.from.index);
}

function isTableauKingToEmpty(state: GameState, move: Move): boolean {
  if (move.from.pile !== "tableau" || move.to.pile !== "tableau") return false;
  if ((state.tableau[move.to.index] ?? []).length !== 0) return false;
  const cards = getSourceCards(state, move.from);
  if (!cards?.[0] || cards[0].rank !== 13) return false;
  const pile = state.tableau[move.from.index] ?? [];
  return pile.slice(0, move.from.cardIndex).some((card) => !card.faceUp);
}

function isKingToEmpty(state: GameState, move: Move): boolean {
  if (move.to.pile !== "tableau") return false;
  if ((state.tableau[move.to.index] ?? []).length !== 0) return false;
  const cards = getSourceCards(state, move.from);
  if (!cards?.[0] || cards[0].rank !== 13) return false;
  if (move.from.pile === "waste") return true;
  return isTableauKingToEmpty(state, move);
}

function listKingToEmpty(state: GameState): Move[] {
  const dests: Dest[] = [];
  for (let i = 0; i < 7; i++) {
    if ((state.tableau[i] ?? []).length === 0) {
      dests.push({ pile: "tableau", index: i });
    }
  }
  if (dests.length === 0) return [];
  const froms: Source[] = [];
  const waste = topOf(state.waste);
  if (waste?.rank === 13) froms.push({ pile: "waste" });
  for (let col = 0; col < 7; col++) {
    const pile = state.tableau[col]!;
    const firstUp = pile.findIndex((card) => card.faceUp);
    if (firstUp > 0 && pile[firstUp]!.rank === 13) {
      froms.push({ pile: "tableau", index: col, cardIndex: firstUp });
    }
  }
  const moves: Move[] = [];
  for (const from of froms) {
    for (const to of dests) {
      if (!tryMove(state, from, to)) continue;
      const kind: Move["kind"] =
        from.pile === "waste" ? "waste" : "reveal";
      const move: Move = { from, to, kind };
      if (from.pile === "tableau" && !isTableauKingToEmpty(state, move)) continue;
      moves.push(move);
    }
  }
  return moves;
}

function kingMoveUnhides(state: GameState, from: Source): boolean {
  if (from.pile !== "tableau") return false;
  return (state.tableau[from.index] ?? [])
    .slice(0, from.cardIndex)
    .some((card) => !card.faceUp);
}

function isWasteLanding(state: GameState, from: Source): boolean {
  const cards = getSourceCards(state, from);
  if (!cards || cards.length !== 1) return false;
  const waste = topOf(state.waste);
  return Boolean(waste && canPlaceOnTableau(waste, cards[0]!));
}

function foundationUnblocks(state: GameState, move: Move): boolean {
  const next = tryMove(state, move.from, move.to);
  if (!next) return false;
  const destCol = move.to.pile === "tableau" ? move.to.index : -1;
  if (destCol < 0) return false;
  return listLegalMoves(next).some((step) => {
    if (step.from.pile !== "tableau") return false;
    if (step.to.pile !== "tableau" || step.to.index !== destCol) return false;
    return exposesPlayableVisible(next, step);
  });
}

function consolidatesTableau(state: GameState, move: Move): boolean {
  if (move.from.pile !== "tableau" || move.to.pile !== "tableau") return false;
  if (isKingStackWithoutHidden(state, move)) return false;
  if ((state.tableau[move.to.index] ?? []).length === 0) return false;
  if (move.kind === "reveal") return true;
  if (move.from.cardIndex !== 0) return false;
  const next = tryMove(state, move.from, move.to);
  if (!next) return false;
  return (next.tableau[move.from.index] ?? []).length === 0;
}

function isAdvancingMove(state: GameState, move: Move): boolean {
  if (isKingToEmpty(state, move)) return true;
  if (move.to.pile === "tableau" && isKingStackWithoutHidden(state, move)) {
    return false;
  }
  if (move.kind === "foundation" || move.kind === "waste" || move.kind === "reveal") {
    return true;
  }
  if (move.from.pile === "foundation") return foundationUnblocks(state, move);
  if (isTableauKingToEmpty(state, move)) return true;
  if (consolidatesTableau(state, move)) return true;
  return exposesPlayableVisible(state, move);
}

function listAdvancingMoves(state: GameState): Move[] {
  return listLegalMoves(state).filter((move) => isAdvancingMove(state, move));
}

function isAceToFoundation(state: GameState, move: Move): boolean {
  if (move.to.pile !== "foundation") return false;
  const cards = getSourceCards(state, move.from);
  return Boolean(cards?.[0] && cards[0].rank === 1);
}

function isTopCardReveal(state: GameState, move: Move): boolean {
  if (move.from.pile !== "tableau" || move.kind !== "reveal") return false;
  const pile = state.tableau[move.from.index]!;
  return move.from.cardIndex === pile.length - 1;
}

function pickAdvancing(
  state: GameState,
  moves: Move[],
  seen: Set<string> | null,
  pred: (move: Move) => boolean,
): { from: Source; to: Dest } | null {
  for (const move of moves) {
    if (!pred(move)) continue;
    const next = tryMove(state, move.from, move.to);
    if (!next) continue;
    if (seen && seen.has(positionKey(next))) continue;
    return { from: move.from, to: move.to };
  }
  return null;
}

function chooseAdvancing(
  state: GameState,
  seen: Set<string> | null,
): { from: Source; to: Dest } | null {
  const moves = listAdvancingMoves(state);
  const ace = pickAdvancing(state, moves, seen, (move) =>
    isAceToFoundation(state, move),
  );
  if (ace) return ace;
  const unhideKing = pickAdvancing(state, listKingToEmpty(state), seen, (move) =>
    move.from.pile === "waste" || kingMoveUnhides(state, move.from),
  );
  if (unhideKing) return unhideKing;
  const king = pickAdvancing(state, moves, seen, (move) =>
    isTableauKingToEmpty(state, move),
  );
  if (king) return king;
  const openKing = pickAdvancing(state, moves, seen, (move) =>
    consolidatesTableau(state, move),
  );
  if (openKing) return openKing;
  const uncover = pickAdvancing(state, moves, seen, (move) =>
    isTopCardReveal(state, move),
  );
  if (uncover) return uncover;
  const order: Move["kind"][] = ["foundation", "reveal", "waste", "tableau"];
  for (const kind of order) {
    const hit = pickAdvancing(state, moves, seen, (move) => {
      if (move.kind !== kind) return false;
      if (kind === "reveal" && isTopCardReveal(state, move)) return false;
      if (kind === "foundation" && isWasteLanding(state, move.from)) return false;
      return true;
    });
    if (hit) return hit;
  }
  return null;
}

export function findHint(
  state: GameState,
): { from: Source; to: Dest } | "draw" | null {
  const hit = chooseAdvancing(state, null);
  if (hit) return hit;
  if (canAdvanceByDrawing(state)) return "draw";
  return null;
}

export function findAutoplayStep(
  state: GameState,
  seen: Set<string>,
): { from: Source; to: Dest } | "draw" | null {
  const hit = chooseAdvancing(state, seen);
  if (hit) return hit;
  const leftover = listLegalMoves(state).filter((move) => {
    if (isKingToEmpty(state, move)) return true;
    if (move.from.pile === "foundation") return false;
    if (move.to.pile === "tableau" && isKingStackWithoutHidden(state, move)) {
      return false;
    }
    if (move.to.pile === "foundation" || move.from.pile === "waste") return true;
    if (move.kind === "reveal") return true;
    return exposesPlayableVisible(state, move) || consolidatesTableau(state, move);
  });
  for (const move of leftover) {
    const next = tryMove(state, move.from, move.to);
    if (!next) continue;
    if (seen.has(positionKey(next))) continue;
    return { from: move.from, to: move.to };
  }
  if (canAdvanceByDrawing(state)) return "draw";
  return null;
}

const SUIT_GLYPH: Record<Suit, string> = {
  spades: "♠",
  hearts: "♥",
  diamonds: "♦",
  clubs: "♣",
};

export function shortCard(card: Card): string {
  return `${RANK_LABEL[card.rank]}${SUIT_GLYPH[card.suit]}`;
}

export function describeAction(
  state: GameState,
  step: { from: Source; to: Dest } | "draw",
): string {
  if (step === "draw") {
    if (state.stock.length === 0) return "Redeal stock";
    const n = Math.min(state.drawCount, state.stock.length);
    return n === 1 ? "Draw 1" : `Draw ${n}`;
  }
  const cards = getSourceCards(state, step.from);
  const head = cards?.[0];
  const name = head ? shortCard(head) : "card";
  const extra = cards && cards.length > 1 ? `+${cards.length - 1}` : "";
  const origin =
    step.from.pile === "waste"
      ? "waste"
      : step.from.pile === "foundation"
        ? SUIT_GLYPH[foundationSuit(step.from.index)]
        : `col ${step.from.index + 1}`;
  const dest =
    step.to.pile === "foundation"
      ? SUIT_GLYPH[foundationSuit(step.to.index)]
      : `col ${step.to.index + 1}`;
  return extra ? `${name} ${extra} ${origin} → ${dest}` : `${name} ${origin} → ${dest}`;
}

export function listHintLabels(state: GameState): string[] {
  const labels: string[] = [];
  const order: Move["kind"][] = ["foundation", "reveal", "waste", "tableau"];
  const advancing = listAdvancingMoves(state);
  for (const kind of order) {
    for (const move of advancing) {
      if (move.kind !== kind) continue;
      labels.push(describeAction(state, { from: move.from, to: move.to }));
    }
  }
  if (canAdvanceByDrawing(state)) {
    labels.push(describeAction(state, "draw"));
  }
  return labels;
}

export function annotateHints(hints: string[], chosen: string): string[] {
  let marked = false;
  const next = hints.map((label) => {
    if (!marked && label === chosen) {
      marked = true;
      return `* ${label}`;
    }
    return label;
  });
  if (!marked && chosen) next.unshift(`* ${chosen}`);
  return next;
}

export function hintsForAction(
  state: GameState,
  step: { from: Source; to: Dest } | "draw" | string,
): string[] {
  const chosen =
    typeof step === "string" ? step : describeAction(state, step);
  return annotateHints(listHintLabels(state), chosen);
}

export function positionKey(state: GameState): string {
  const ids = (cards: Card[]) =>
    cards.map((card) => `${card.id}${card.faceUp ? "+" : "-"}`).join(",");
  return [
    ids(state.stock),
    ids(state.waste),
    state.foundations.map(ids).join("/"),
    state.tableau.map(ids).join("/"),
  ].join("|");
}

function canAdvanceByDrawing(state: GameState): boolean {
  if (state.stock.length === 0 && state.waste.length === 0) return false;
  if (state.drawCount === 1) return state.stock.length > 0;
  const passes = state.stockPasses ?? 0;
  if (state.stock.length === 0 && passes >= 2) return false;
  if (passes < 2) return true;
  return state.stock.length > 0;
}

/** True when autoplay has nothing left (pass limits apply; tableau shuffles don't count). */
export function isStuck(state: GameState): boolean {
  if (state.won) return false;
  return findAutoplayStep(state, new Set()) === null;
}

export function findFoundationStep(
  state: GameState,
): { from: Source; to: Dest } | null {
  const tryFrom = (from: Source) => {
    const cards = getSourceCards(state, from);
    if (!cards || cards.length !== 1) return null;
    for (let i = 0; i < 4; i++) {
      const to: Dest = { pile: "foundation", index: i };
      if (tryMove(state, from, to)) return { from, to };
    }
    return null;
  };

  if (state.waste.length > 0) {
    const hit = tryFrom({ pile: "waste" });
    if (hit) return hit;
  }
  for (let col = 0; col < 7; col++) {
    const pile = state.tableau[col]!;
    if (pile.length === 0) continue;
    const hit = tryFrom({
      pile: "tableau",
      index: col,
      cardIndex: pile.length - 1,
    });
    if (hit) return hit;
  }
  return null;
}

export function canAutoComplete(state: GameState): boolean {
  if (state.won) return false;
  if (state.tableau.some((col) => col.some((card) => !card.faceUp))) return false;
  let cursor = cloneState(state);
  let guard = 0;
  while (!isWon(cursor) && guard < 64) {
    const step = findFoundationStep(cursor);
    if (!step) return false;
    const next = tryMove(cursor, step.from, step.to);
    if (!next) return false;
    cursor = next;
    guard += 1;
  }
  return isWon(cursor);
}

export function elapsedSeconds(state: GameState, now = Date.now()): number {
  if (!state.startedAt) return 0;
  const end = state.finishedAt ?? now;
  return Math.max(0, Math.floor((end - state.startedAt) / 1000));
}

export function displayedScore(state: GameState, now = Date.now()): number {
  if (state.won || !state.startedAt) return state.score;
  const penalty = Math.floor(elapsedSeconds(state, now) / 10) * 2;
  return Math.max(0, state.score - penalty);
}

export function parseDropTarget(value: string | null): Dest | null {
  if (!value) return null;
  if (value.startsWith("foundation:")) {
    const index = Number(value.slice("foundation:".length));
    if (index >= 0 && index < 4) return { pile: "foundation", index };
  }
  if (value.startsWith("tableau:")) {
    const index = Number(value.slice("tableau:".length));
    if (index >= 0 && index < 7) return { pile: "tableau", index };
  }
  return null;
}

export function sourceKey(from: Source): string {
  if (from.pile === "waste") return "waste";
  if (from.pile === "foundation") return `foundation:${from.index}`;
  return `tableau:${from.index}:${from.cardIndex}`;
}

export function destKey(to: Dest): string {
  return `${to.pile}:${to.index}`;
}

export function sourcesEqual(a: Source | null, b: Source | null): boolean {
  if (!a || !b) return a === b;
  return sourceKey(a) === sourceKey(b);
}

export function dropMatchesSource(from: Source, to: Dest): boolean {
  return samePile(from, to);
}

export function topSource(pile: "waste" | "foundation" | "tableau", index = 0, cardIndex = 0): Source {
  if (pile === "waste") return { pile: "waste" };
  if (pile === "foundation") return { pile: "foundation", index };
  return { pile: "tableau", index, cardIndex };
}

export function suitOf(id: string): Suit {
  return id.split("-")[0] as Suit;
}
