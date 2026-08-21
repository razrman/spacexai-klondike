import {
  type Card,
  type ComboStep,
  type Dest,
  type GameState,
  type LogStep,
  type Move,
  type MoveLogEntry,
  type MoveStep,
  type Rank,
  type Source,
  type Suit,
  FOUNDATION_SUITS,
  isComboStep,
  isMoveStep,
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
  return canGoToFoundation(next, exposed);
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

/** Face-down card would flip if this tableau pack is moved. */
function stackUnhidesHidden(state: GameState, move: Move): boolean {
  if (move.from.pile !== "tableau" || move.to.pile !== "tableau") return false;
  if (move.from.cardIndex <= 0) return false;
  const under = state.tableau[move.from.index]![move.from.cardIndex - 1];
  return Boolean(under && !under.faceUp);
}

/** After a setup onto destCol, a pack can land there and flip a hidden card. */
function followUpUnhides(state: GameState, destCol: number): boolean {
  return listLegalMoves(state).some((step) => {
    if (step.from.pile !== "tableau" || step.to.pile !== "tableau") return false;
    if (step.to.index !== destCol) return false;
    return stackUnhidesHidden(state, step) || exposesPlayableVisible(state, step);
  });
}

/** Foundation → tableau only as the first half of: land a pack on it, then unhide. */
function foundationPullHelps(state: GameState, move: Move): boolean {
  if (move.from.pile !== "foundation" || move.to.pile !== "tableau") return false;
  const next = tryMove(state, move.from, move.to);
  if (!next) return false;
  return followUpUnhides(next, move.to.index);
}

const COMBO_SEP = " then ";

export function listUnhideCombos(
  state: GameState,
  ): { label: string; step: { combo: [MoveStep, MoveStep] } }[] {
  const out: { label: string; step: { combo: [MoveStep, MoveStep] } }[] = [];
  const seen = new Set<string>();
  const add = (first: MoveStep, second: MoveStep) => {
    const step = { combo: [first, second] as [MoveStep, MoveStep] };
    const label = describeAction(state, step);
    if (!label || seen.has(label)) return;
    seen.add(label);
    out.push({ label, step });
  };

  for (const pull of listLegalMoves(state)) {
    if (pull.from.pile !== "foundation" || pull.to.pile !== "tableau") continue;
    const mid = tryMove(state, pull.from, pull.to);
    if (!mid) continue;
    for (const follow of listLegalMoves(mid)) {
      if (follow.from.pile !== "tableau" || follow.to.pile !== "tableau") continue;
      if (follow.to.index !== pull.to.index) continue;
      if (
        !stackUnhidesHidden(mid, follow) &&
        !exposesPlayableVisible(mid, follow)
      ) {
        continue;
      }
      add(
        { from: pull.from, to: pull.to },
        { from: follow.from, to: follow.to },
      );
    }
  }

  for (const shift of listLegalMoves(state)) {
    if (shift.from.pile !== "tableau" || shift.to.pile !== "tableau") continue;
    if (!exposesPlayableVisible(state, shift)) continue;
    const mid = tryMove(state, shift.from, shift.to);
    if (!mid) continue;
    const col = shift.from.index;
    const pile = mid.tableau[col] ?? [];
    const topIndex = pile.length - 1;
    if (topIndex < 0) continue;
    for (const follow of listLegalMoves(mid)) {
      if (follow.from.pile !== "tableau" || follow.to.pile !== "foundation") {
        continue;
      }
      if (follow.from.index !== col) continue;
      if (follow.from.cardIndex !== topIndex) continue;
      add(
        { from: shift.from, to: shift.to },
        { from: follow.from, to: follow.to },
      );
    }
  }
  return out;
}

function comboSetupLabels(state: GameState): Set<string> {
  const labels = new Set<string>();
  for (const combo of listUnhideCombos(state)) {
    labels.add(describeAction(state, combo.step.combo[0]));
  }
  return labels;
}

/** Don't ship a card to foundation if a pack can land on it and unhide. */
function holdsForIncomingUnhide(state: GameState, move: Move): boolean {
  if (move.to.pile !== "foundation") return false;
  if (move.from.pile !== "tableau") return false;
  const pile = state.tableau[move.from.index] ?? [];
  if (move.from.cardIndex !== pile.length - 1) return false;
  return followUpUnhides(state, move.from.index);
}

function isWasteLanding(state: GameState, from: Source): boolean {
  const cards = getSourceCards(state, from);
  if (!cards || cards.length !== 1) return false;
  const waste = topOf(state.waste);
  return Boolean(waste && canPlaceOnTableau(waste, cards[0]!));
}

function consolidatesTableau(state: GameState, move: Move): boolean {
  if (move.from.pile !== "tableau" || move.to.pile !== "tableau") return false;
  if (isKingStackWithoutHidden(state, move)) return false;
  if ((state.tableau[move.to.index] ?? []).length === 0) return false;
  if (move.from.cardIndex !== 0) return false;
  const next = tryMove(state, move.from, move.to);
  if (!next) return false;
  if ((next.tableau[move.from.index] ?? []).length !== 0) return false;
  return listKingToEmpty(next).length > 0;
}

function isSearchMove(state: GameState, move: Move): boolean {
  if (move.from.pile === "foundation") return false;
  if (move.to.pile === "tableau" && isKingStackWithoutHidden(state, move)) {
    return false;
  }
  if (move.to.pile === "foundation" || move.from.pile === "waste") return true;
  return isAdvancingMove(state, move);
}

function isAdvancingMove(state: GameState, move: Move): boolean {
  if (move.from.pile === "foundation") return false;
  if (isKingToEmpty(state, move)) return true;
  if (move.to.pile === "tableau" && isKingStackWithoutHidden(state, move)) {
    return false;
  }
  if (move.kind === "foundation" || move.kind === "waste" || move.kind === "reveal") {
    return true;
  }
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

function pickCombo(
  state: GameState,
  seen: Set<string> | null,
): ComboStep | null {
  for (const combo of listUnhideCombos(state)) {
    const next = applyStep(state, combo.step);
    if (!next) continue;
    if (seen && seen.has(positionKey(next))) continue;
    return combo.step;
  }
  return null;
}

function chooseAdvancing(
  state: GameState,
  seen: Set<string> | null,
): Exclude<LogStep, "draw"> | null {
  const moves = listAdvancingMoves(state);
  const setups = comboSetupLabels(state);
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
  const combo = pickCombo(state, seen);
  if (combo) return combo;
  const order: Move["kind"][] = ["foundation", "reveal", "waste", "tableau"];
  for (const kind of order) {
    const hit = pickAdvancing(state, moves, seen, (move) => {
      if (move.kind !== kind) return false;
      if (kind === "reveal" && isTopCardReveal(state, move)) return false;
      if (kind === "foundation" && isWasteLanding(state, move.from)) return false;
      if (kind === "foundation" && holdsForIncomingUnhide(state, move)) return false;
      if (
        setups.has(describeAction(state, { from: move.from, to: move.to }))
      ) {
        return false;
      }
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
  if (hit) {
    if (isComboStep(hit)) return hit.combo[0];
    if (isMoveStep(hit)) return hit;
  }
  if (canAdvanceByDrawing(state)) return "draw";
  return null;
}

export function findAutoplayStep(
  state: GameState,
  seen: Set<string>,
): LogStep | null {
  const hit = chooseAdvancing(state, seen);
  if (hit) return hit;
  const leftover = listLegalMoves(state).filter((move) => {
    if (!isSearchMove(state, move)) return false;
    if (holdsForIncomingUnhide(state, move)) return false;
    if (
      comboSetupLabels(state).has(
        describeAction(state, { from: move.from, to: move.to }),
      )
    ) {
      return false;
    }
    return true;
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
  step: LogStep,
): string {
  if (step === "draw") {
    if (state.stock.length === 0) return "Redeal stock";
    const n = Math.min(state.drawCount, state.stock.length);
    return n === 1 ? "Draw 1" : `Draw ${n}`;
  }
  if (isComboStep(step)) {
    const mid = tryMove(state, step.combo[0].from, step.combo[0].to);
    const first = describeAction(state, step.combo[0]);
    const second = mid
      ? describeAction(mid, step.combo[1])
      : "follow-up";
    return `${first}${COMBO_SEP}${second}`;
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
  const seen = new Set<string>();
  const add = (label: string) => {
    if (!label || seen.has(label)) return;
    seen.add(label);
    labels.push(label);
  };
  for (const combo of listUnhideCombos(state)) add(combo.label);
  const setups = comboSetupLabels(state);
  const order: Move["kind"][] = ["foundation", "reveal", "waste", "tableau"];
  const advancing = listAdvancingMoves(state);
  for (const kind of order) {
    for (const move of advancing) {
      if (move.kind !== kind) continue;
      if (move.from.pile === "foundation") continue;
      const label = describeAction(state, { from: move.from, to: move.to });
      if (setups.has(label)) continue;
      add(label);
    }
  }
  if (canAdvanceByDrawing(state)) {
    add(describeAction(state, "draw"));
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
  step: LogStep | string,
): string[] {
  const chosen =
    typeof step === "string" ? step : describeAction(state, step);
  return annotateHints(listHintLabels(state), chosen);
}

export type DecisionBranch = {
  label: string;
  lane: "auto" | "legal";
};

export function listDecisionBranches(state: GameState): DecisionBranch[] {
  const seen = new Set<string>();
  const out: DecisionBranch[] = [];
  const add = (label: string, lane: DecisionBranch["lane"]) => {
    if (!label || seen.has(label)) return;
    seen.add(label);
    out.push({ label, lane });
  };
  for (const label of listHintLabels(state)) add(label, "auto");
  const step = findAutoplayStep(state, new Set());
  if (step) add(describeAction(state, step), "auto");
  for (const move of listLegalMoves(state)) {
    add(describeAction(state, { from: move.from, to: move.to }), "legal");
  }
  return out;
}

export function effectivePlays(log: { action: string }[]): typeof log {
  const stack: typeof log = [];
  for (const row of log) {
    if (row.action === "undo") stack.pop();
    else stack.push(row);
  }
  return stack;
}

export function playsForPath(log: MoveLogEntry[], path: number): MoveLogEntry[] {
  const byPath = new Map<number, MoveLogEntry[]>();
  for (const row of log) {
    if (row.action === "undo") continue;
    const id = row.path ?? 1;
    const list = byPath.get(id) ?? [];
    list.push(row);
    byPath.set(id, list);
  }
  const build = (id: number, seen: Set<number>): MoveLogEntry[] => {
    if (seen.has(id)) return [];
    seen.add(id);
    const mine = (byPath.get(id) ?? [])
      .slice()
      .sort((a, b) => (a.move ?? a.n) - (b.move ?? b.n));
    if (id === 1 || mine.length === 0) return mine;
    const head = mine[0]!;
    const parent = head.parentPath ?? 1;
    const branchMove = head.move ?? head.n;
    const prefix = build(parent, seen).filter(
      (row) => (row.move ?? row.n) < branchMove,
    );
    return [...prefix, ...mine];
  };
  return build(path, new Set());
}

export function maxPathId(log: MoveLogEntry[]): number {
  let max = 1;
  for (const row of log) {
    const id = row.path ?? 1;
    if (id > max) max = id;
  }
  return max;
}

export function isFlipLabel(label: string): boolean {
  return /^(Draw \d+|Redeal stock)$/i.test(label.replace(/^\*\s*/, "").trim());
}

function isFoundationFromLabel(label: string): boolean {
  return /\s[♠♥♦♣]\s→\scol\s/u.test(label.replace(/^\*\s*/, "").trim());
}

export function listOpeningLabels(
  seed: number,
  drawCount: 1 | 3,
  dealId?: number,
): string[] {
  return listCardPlayLabels(
    createGame({ seed, drawCount, dealId }),
  );
}

export function listCardPlayLabels(state: GameState): string[] {
  const labels: string[] = [];
  const seen = new Set<string>();
  for (const combo of listUnhideCombos(state)) {
    if (seen.has(combo.label)) continue;
    seen.add(combo.label);
    labels.push(combo.label);
  }
  const setups = comboSetupLabels(state);
  for (const move of listLegalMoves(state)) {
    if (move.from.pile === "foundation") continue;
    const label = describeAction(state, { from: move.from, to: move.to });
    if (!label || seen.has(label) || setups.has(label)) continue;
    seen.add(label);
    labels.push(label);
  }
  return labels;
}

export function decisionChoices(
  row: MoveLogEntry,
): { label: string; tried: boolean }[] {
  const raw =
    row.hints && row.hints.length > 0 ? row.hints : [`* ${row.label}`];
  const live = row.label.replace(/^\*\s*/, "").trim();
  const tried = new Set<string>();
  const add = (value?: string) => {
    const text = value?.replace(/^\*\s*/, "").trim();
    if (text) tried.add(text);
  };
  add(live);
  row.tried?.forEach(add);
  const order: string[] = [];
  const seen = new Set<string>();
  const push = (value: string) => {
    if (!value || seen.has(value) || isFlipLabel(value)) return;
    seen.add(value);
    order.push(value);
  };
  for (const hint of raw) {
    const text = hint.replace(/^\*\s*/, "").trim();
    if (hint.startsWith("*")) add(text);
    push(text);
  }
  for (const text of tried) push(text);
  return order.map((label) => ({ label, tried: tried.has(label) }));
}

export function findDfsBranch(
  log: MoveLogEntry[],
  currentPath: number,
  state: GameState,
  seen: Set<string> = new Set(),
  ignore: Set<string> = new Set(),
): { path: number; move: number; label: string } | null {
  const origin = createGame({
    seed: state.seed,
    drawCount: state.drawCount,
    dealId: state.dealId,
  });
  const triedOf = (row: MoveLogEntry | null): Set<string> => {
    const tried = new Set<string>();
    if (!row) return tried;
    const add = (value?: string) => {
      const text = value?.replace(/^\*\s*/, "").trim();
      if (text) tried.add(text);
    };
    add(row.label);
    row.tried?.forEach(add);
    row.hints?.forEach((hint) => {
      if (hint.startsWith("*")) add(hint);
    });
    return tried;
  };
  const pick = (
    before: GameState,
    row: MoveLogEntry | null,
    path: number,
    ply: number,
  ): { path: number; move: number; label: string } | null => {
    const tried = triedOf(row);
    for (const combo of listUnhideCombos(before)) {
      if (tried.has(combo.label)) continue;
      if (ignore.has(`${path}:${ply}:${combo.label}`)) continue;
      const next = applyStep(before, combo.step);
      if (!next || seen.has(positionKey(next))) continue;
      return { path, move: ply, label: combo.label };
    }
    const setups = comboSetupLabels(before);
    for (const step of listLegalMoves(before)) {
      if (!isSearchMove(before, step)) continue;
      const label = describeAction(before, { from: step.from, to: step.to });
      if (!label || tried.has(label) || setups.has(label)) continue;
      if (ignore.has(`${path}:${ply}:${label}`)) continue;
      const next = tryMove(before, step.from, step.to);
      if (!next || seen.has(positionKey(next))) continue;
      return { path, move: ply, label };
    }
    return null;
  };
  const scan = (path: number) => {
    const lineage = playsForPath(log, path);
    const states: GameState[] = [origin];
    let cursor = origin;
    for (let i = 0; i < lineage.length; i++) {
      const row = lineage[i]!;
      const step = row.step ?? stepFromLabel(cursor, row.label);
      const next = step ? applyStep(cursor, step) : null;
      if (!next) break;
      states.push(next);
      cursor = next;
    }
    for (let i = Math.min(lineage.length, states.length - 1) - 1; i >= 0; i--) {
      const row = lineage[i]!;
      const hit = pick(states[i]!, row, row.path ?? 1, row.move ?? row.n);
      if (hit) return hit;
    }
    return null;
  };
  const current = scan(currentPath);
  if (current) return current;
  for (let path = maxPathId(log); path >= 1; path--) {
    if (path === currentPath) continue;
    const hit = scan(path);
    if (hit) return hit;
  }
  const leftover = pick(state, null, currentPath, -1);
  if (leftover) {
    const step = stepFromLabel(state, leftover.label);
    if (step) {
      const next = applyStep(state, step);
      if (next && !seen.has(positionKey(next))) return leftover;
    }
  }
  return null;
}

export function stepFromLabel(
  state: GameState,
  label: string,
): LogStep | null {
  const want = label.replace(/^\*\s*/, "").replace(/\s*\(finish\)$/, "").trim();
  if (!want) return null;
  if (/^(Draw \d+|Redeal stock)$/i.test(want)) {
    const next = draw(state);
    return next ? "draw" : null;
  }
  const split = want.indexOf(COMBO_SEP);
  if (split > 0) {
    const first = stepFromLabel(state, want.slice(0, split).trim());
    if (!first || first === "draw" || isComboStep(first)) return null;
    const mid = tryMove(state, first.from, first.to);
    if (!mid) return null;
    const second = stepFromLabel(mid, want.slice(split + COMBO_SEP.length).trim());
    if (!second || second === "draw" || isComboStep(second)) return null;
    return { combo: [first, second] };
  }
  for (const combo of listUnhideCombos(state)) {
    if (combo.label === want) return combo.step;
  }
  for (const move of listLegalMoves(state)) {
    const text = describeAction(state, { from: move.from, to: move.to });
    if (text === want) return { from: move.from, to: move.to };
  }
  const flip = describeAction(state, "draw");
  if (flip === want && draw(state)) return "draw";
  return null;
}

export function applyStep(
  state: GameState,
  step: LogStep,
): GameState | null {
  if (step === "draw") return draw(state);
  if (isComboStep(step)) {
    let cursor: GameState | null = state;
    for (const part of step.combo) {
      cursor = tryMove(cursor, part.from, part.to);
      if (!cursor) return null;
    }
    return cursor;
  }
  return tryMove(state, step.from, step.to);
}

export function replayDeal(
  origin: GameState,
  plays: { step?: LogStep; label: string }[],
): GameState | null {
  let cursor = origin;
  for (const play of plays) {
    const step = play.step ?? stepFromLabel(cursor, play.label);
    if (!step) return null;
    const next = applyStep(cursor, step);
    if (!next) return null;
    cursor = next;
  }
  return cursor;
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
