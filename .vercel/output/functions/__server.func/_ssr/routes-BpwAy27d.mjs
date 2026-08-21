import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as RotateCcw, n as Volume2, o as Lightbulb, r as Undo2, s as CircleHelp, t as VolumeX } from "../_libs/lucide-react.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { t as Slot } from "../_libs/radix-ui__react-slot.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-BpwAy27d.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var PATHS = {
	spades: "M16 2C13.2 8.2 5.5 13.2 5.5 19.2C5.5 23.4 8.8 26.5 12.8 26.5C14.2 26.5 15.3 26.1 16 25.3C16.7 26.1 17.8 26.5 19.2 26.5C23.2 26.5 26.5 23.4 26.5 19.2C26.5 13.2 18.8 8.2 16 2ZM12.4 25.2L16 31.2L19.6 25.2",
	hearts: "M16 29.5C16 29.5 4 19.8 4 12.4C4 8.2 7.2 5 11.2 5C13.5 5 15.4 6.1 16 7.8C16.6 6.1 18.5 5 20.8 5C24.8 5 28 8.2 28 12.4C28 19.8 16 29.5 16 29.5Z",
	diamonds: "M16 2.5L28 16L16 29.5L4 16Z",
	clubs: "M16 4.2C13.1 4.2 10.8 6.5 10.8 9.4C10.8 11.4 12 13.1 13.7 13.8C12 12.9 9.6 13.4 8.2 15C6.6 16.8 6.8 19.4 8.6 21C9.9 22.1 11.7 22.4 13.3 21.8C12.8 23.2 12.6 24.4 12.4 25.4L16 31L19.6 25.4C19.4 24.4 19.2 23.2 18.7 21.8C20.3 22.4 22.1 22.1 23.4 21C25.2 19.4 25.4 16.8 23.8 15C22.4 13.4 20 12.9 18.3 13.8C20 13.1 21.2 11.4 21.2 9.4C21.2 6.5 18.9 4.2 16 4.2Z"
};
function SuitIcon({ suit, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
		viewBox: "0 0 32 32",
		className: cn("inline-block", className),
		"aria-hidden": "true",
		focusable: "false",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: PATHS[suit],
			fill: "currentColor"
		})
	});
}
var SUITS = [
	"spades",
	"hearts",
	"diamonds",
	"clubs"
];
var RANKS = [
	1,
	2,
	3,
	4,
	5,
	6,
	7,
	8,
	9,
	10,
	11,
	12,
	13
];
var RANK_LABEL = [
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
	"K"
];
var SUIT_LABEL = {
	spades: "Spades",
	hearts: "Hearts",
	diamonds: "Diamonds",
	clubs: "Clubs"
};
var RANK_NAME = {
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
	13: "King"
};
function isRed(suit) {
	return suit === "hearts" || suit === "diamonds";
}
function cardLabel(card) {
	return `${RANK_NAME[card.rank]} of ${SUIT_LABEL[card.suit]}`;
}
function formatTime(totalSeconds) {
	const s = Math.max(0, Math.floor(totalSeconds));
	return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
}
var PIP_LAYOUT = {
	1: [[50, 50]],
	2: [[50, 22], [50, 78]],
	3: [
		[50, 20],
		[50, 50],
		[50, 80]
	],
	4: [
		[28, 22],
		[72, 22],
		[28, 78],
		[72, 78]
	],
	5: [
		[28, 22],
		[72, 22],
		[50, 50],
		[28, 78],
		[72, 78]
	],
	6: [
		[28, 22],
		[72, 22],
		[28, 50],
		[72, 50],
		[28, 78],
		[72, 78]
	],
	7: [
		[28, 20],
		[72, 20],
		[50, 35],
		[28, 50],
		[72, 50],
		[28, 80],
		[72, 80]
	],
	8: [
		[28, 18],
		[72, 18],
		[28, 40],
		[72, 40],
		[28, 60],
		[72, 60],
		[28, 82],
		[72, 82]
	],
	9: [
		[28, 18],
		[72, 18],
		[28, 40],
		[72, 40],
		[50, 50],
		[28, 60],
		[72, 60],
		[28, 82],
		[72, 82]
	],
	10: [
		[28, 16],
		[72, 16],
		[50, 28],
		[28, 38],
		[72, 38],
		[28, 62],
		[72, 62],
		[50, 72],
		[28, 84],
		[72, 84]
	]
};
function Face({ card, compact }) {
	const color = isRed(card.suit) ? "text-suit-red" : "text-suit-black";
	const label = RANK_LABEL[card.rank];
	const pips = PIP_LAYOUT[card.rank];
	const face = card.rank > 10;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("relative flex h-full w-full flex-col overflow-hidden rounded-[inherit] bg-card text-ink", color),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute top-[5%] left-[7%] flex flex-col items-center leading-none",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: cn("font-display font-semibold tracking-tight", compact ? "text-[0.7rem]" : "text-[0.85rem]", label === "10" && (compact ? "text-[0.62rem]" : "text-[0.75rem]")),
					children: label
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SuitIcon, {
					suit: card.suit,
					className: compact ? "size-2.5" : "size-3.5"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute right-[7%] bottom-[5%] flex rotate-180 flex-col items-center leading-none",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: cn("font-display font-semibold tracking-tight", compact ? "text-[0.7rem]" : "text-[0.85rem]", label === "10" && (compact ? "text-[0.62rem]" : "text-[0.75rem]")),
					children: label
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SuitIcon, {
					suit: card.suit,
					className: compact ? "size-2.5" : "size-3.5"
				})]
			}),
			compact || !pips || face ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex h-full items-center justify-center",
				children: face ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: cn("flex items-center justify-center rounded-md border border-current/15", compact ? "h-[42%] w-[46%]" : "h-[48%] w-[52%]"),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: cn("font-display font-semibold leading-none", compact ? "text-xl" : "text-3xl"),
						children: label
					})
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SuitIcon, {
					suit: card.suit,
					className: compact ? "size-7" : "size-10"
				})
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-[18%_16%]",
				children: pips.map(([x, y], i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "absolute",
					style: {
						left: `${x}%`,
						top: `${y}%`,
						transform: `translate(-50%, -50%) ${y > 55 ? "rotate(180deg)" : ""}`
					},
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SuitIcon, {
						suit: card.suit,
						className: card.rank === 1 ? "size-8" : "size-3.5"
					})
				}, `${card.id}-pip-${i}`))
			})
		]
	});
}
function Back() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative h-full w-full overflow-hidden rounded-[inherit] bg-back",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "absolute inset-[7%] rounded-[calc(var(--card-radius)-2px)] border border-cream/25",
			style: { backgroundImage: `
            repeating-linear-gradient(45deg, color-mix(in oklab, var(--color-cream) 16%, transparent) 0 1px, transparent 1px 9px),
            repeating-linear-gradient(-45deg, color-mix(in oklab, var(--color-cream) 16%, transparent) 0 1px, transparent 1px 9px)
          ` }
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "absolute inset-0 flex items-center justify-center",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "size-[28%] rotate-45 rounded-[2px] border border-cream/35 bg-felt-ridge/80" })
		})]
	});
}
function CardView({ card, compact, selected, hinted, dimmed, style, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("card-face pointer-events-none select-none", selected && "card-selected", hinted && "card-hinted", dimmed && "opacity-40", className),
		style,
		children: card.faceUp ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Face, {
			card,
			compact
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Back, {})
	});
}
function CardBack({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("card-face pointer-events-none select-none", className),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Back, {})
	});
}
function EmptySlot({ className, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("card-slot", className),
		children
	});
}
function mulberry32(seed) {
	let a = seed >>> 0;
	return () => {
		a = a + 1831565813 >>> 0;
		let t = a;
		t = Math.imul(t ^ t >>> 15, t | 1);
		t ^= t + Math.imul(t ^ t >>> 7, t | 61);
		return ((t ^ t >>> 14) >>> 0) / 4294967296;
	};
}
function cloneCard(card) {
	return { ...card };
}
function cloneState(state) {
	return {
		...state,
		stock: state.stock.map(cloneCard),
		waste: state.waste.map(cloneCard),
		foundations: [
			state.foundations[0].map(cloneCard),
			state.foundations[1].map(cloneCard),
			state.foundations[2].map(cloneCard),
			state.foundations[3].map(cloneCard)
		],
		tableau: [
			state.tableau[0].map(cloneCard),
			state.tableau[1].map(cloneCard),
			state.tableau[2].map(cloneCard),
			state.tableau[3].map(cloneCard),
			state.tableau[4].map(cloneCard),
			state.tableau[5].map(cloneCard),
			state.tableau[6].map(cloneCard)
		]
	};
}
function makeDeck() {
	const deck = [];
	for (const suit of SUITS) for (const rank of RANKS) deck.push({
		id: `${suit}-${rank}`,
		suit,
		rank,
		faceUp: false
	});
	return deck;
}
function shuffle(items, rng) {
	const arr = items.slice();
	for (let i = arr.length - 1; i > 0; i--) {
		const j = Math.floor(rng() * (i + 1));
		const tmp = arr[i];
		arr[i] = arr[j];
		arr[j] = tmp;
	}
	return arr;
}
function createGame(opts) {
	const seed = opts?.seed ?? (Math.floor(Math.random() * 4294967295) || 1);
	const drawCount = opts?.drawCount ?? 1;
	const rng = mulberry32(seed);
	const deck = shuffle(makeDeck(), rng);
	const tableau = [
		[],
		[],
		[],
		[],
		[],
		[],
		[]
	];
	for (let col = 0; col < 7; col++) for (let n = 0; n <= col; n++) {
		const card = deck.pop();
		if (!card) throw new Error("Deck underflow while dealing");
		tableau[col].push({
			...card,
			faceUp: n === col
		});
	}
	return {
		stock: deck.map((card) => ({
			...card,
			faceUp: false
		})),
		waste: [],
		foundations: [
			[],
			[],
			[],
			[]
		],
		tableau,
		drawCount,
		moves: 0,
		score: 0,
		startedAt: null,
		finishedAt: null,
		won: false,
		seed,
		sessionCounted: false,
		dealId: opts?.dealId ?? seed
	};
}
function topOf(pile) {
	return pile[pile.length - 1];
}
function canPlaceOnTableau(card, destTop) {
	if (!destTop) return card.rank === 13;
	return destTop.rank === card.rank + 1 && isRed(destTop.suit) !== isRed(card.suit);
}
function canPlaceOnFoundation(card, destTop) {
	if (!destTop) return card.rank === 1;
	return destTop.suit === card.suit && destTop.rank + 1 === card.rank;
}
function isValidRun(cards) {
	if (cards.length === 0) return false;
	for (let i = 0; i < cards.length; i++) {
		const card = cards[i];
		if (!card.faceUp) return false;
		if (i === 0) continue;
		const prev = cards[i - 1];
		if (prev.rank !== card.rank + 1) return false;
		if (isRed(prev.suit) === isRed(card.suit)) return false;
	}
	return true;
}
function getSourceCards(state, from) {
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
function isMovable(state, from) {
	return getSourceCards(state, from) !== null;
}
function bumpClock(state) {
	if (state.startedAt !== null || state.won) return state;
	return {
		...state,
		startedAt: Date.now()
	};
}
function addScore(state, delta) {
	return {
		...state,
		score: Math.max(0, state.score + delta)
	};
}
function removeFromSource(state, from, count) {
	const next = cloneState(state);
	if (from.pile === "waste") {
		next.waste.splice(next.waste.length - count, count);
		return next;
	}
	if (from.pile === "foundation") {
		next.foundations[from.index].splice(next.foundations[from.index].length - count, count);
		return next;
	}
	const col = next.tableau[from.index];
	col.splice(from.cardIndex, count);
	const revealed = topOf(col);
	if (revealed && !revealed.faceUp) {
		revealed.faceUp = true;
		return addScore(next, 5);
	}
	return next;
}
function appendToDest(state, to, cards) {
	const next = cloneState(state);
	const faceUp = cards.map((card) => ({
		...card,
		faceUp: true
	}));
	if (to.pile === "foundation") next.foundations[to.index].push(...faceUp);
	else next.tableau[to.index].push(...faceUp);
	return next;
}
function destTop(state, to) {
	if (to.pile === "foundation") return topOf(state.foundations[to.index] ?? []);
	return topOf(state.tableau[to.index] ?? []);
}
function samePile(from, to) {
	if (from.pile === "tableau" && to.pile === "tableau") return from.index === to.index;
	if (from.pile === "foundation" && to.pile === "foundation") return from.index === to.index;
	return false;
}
function scoreForMove(from, to) {
	if (to.pile === "foundation") {
		if (from.pile === "waste") return 10;
		if (from.pile === "tableau") return 10;
		return 0;
	}
	if (from.pile === "waste") return 5;
	if (from.pile === "foundation") return -15;
	return 0;
}
function isWon(state) {
	return state.foundations.every((pile) => pile.length === 13);
}
function markWin(state) {
	if (state.won || !isWon(state)) return state;
	const now = Date.now();
	const elapsed = state.startedAt ? Math.floor((now - state.startedAt) / 1e3) : 0;
	const timePenalty = Math.floor(elapsed / 10) * 2;
	const bonus = Math.max(0, 5e3 - elapsed * 5);
	return {
		...state,
		won: true,
		finishedAt: now,
		score: Math.max(0, state.score - timePenalty) + bonus
	};
}
function tryMove(state, from, to) {
	if (state.won) return null;
	if (samePile(from, to)) return null;
	const cards = getSourceCards(state, from);
	if (!cards) return null;
	const attaching = cards[0];
	if (to.pile === "foundation") {
		if (cards.length !== 1) return null;
		if (!canPlaceOnFoundation(attaching, destTop(state, to))) return null;
	} else if (!canPlaceOnTableau(attaching, destTop(state, to))) return null;
	let next = bumpClock(state);
	next = addScore(next, scoreForMove(from, to));
	next = removeFromSource(next, from, cards.length);
	next = appendToDest(next, to, cards);
	next = {
		...next,
		moves: next.moves + 1,
		sessionCounted: true
	};
	return markWin(next);
}
function draw(state) {
	if (state.won) return null;
	if (state.stock.length === 0 && state.waste.length === 0) return null;
	let next = bumpClock(state);
	next = {
		...next,
		moves: next.moves + 1,
		sessionCounted: true
	};
	if (next.stock.length === 0) {
		const recycled = next.waste.map((card) => ({
			...card,
			faceUp: false
		})).reverse();
		const penalty = next.drawCount === 1 ? -100 : -20;
		next = addScore({
			...next,
			stock: recycled,
			waste: []
		}, penalty);
		return next;
	}
	const take = Math.min(next.drawCount, next.stock.length);
	const drawn = [];
	const stock = next.stock.slice();
	for (let i = 0; i < take; i++) {
		const card = stock.pop();
		if (!card) break;
		drawn.push({
			...card,
			faceUp: true
		});
	}
	return {
		...next,
		stock,
		waste: [...next.waste, ...drawn]
	};
}
function findAutoMove(state, from) {
	const cards = getSourceCards(state, from);
	if (!cards) return null;
	const attaching = cards[0];
	if (cards.length === 1) {
		for (let i = 0; i < 4; i++) if (canPlaceOnFoundation(attaching, topOf(state.foundations[i]))) return {
			pile: "foundation",
			index: i
		};
	}
	const tableauHits = [];
	for (let i = 0; i < 7; i++) {
		if (from.pile === "tableau" && from.index === i) continue;
		if (canPlaceOnTableau(attaching, topOf(state.tableau[i]))) tableauHits.push(i);
	}
	if (tableauHits.length === 1) return {
		pile: "tableau",
		index: tableauHits[0]
	};
	return null;
}
function pointlessKingShift(state, from, to) {
	if (from.pile !== "tableau" || to.pile !== "tableau") return false;
	if (state.tableau[to.index].length > 0) return false;
	if (from.cardIndex !== 0) return false;
	const cards = getSourceCards(state, from);
	return Boolean(cards && cards[0]?.rank === 13);
}
function listLegalMoves(state) {
	const moves = [];
	const consider = (from, to) => {
		if (!tryMove(state, from, to)) return;
		if (!getSourceCards(state, from)) return;
		if (pointlessKingShift(state, from, to)) return;
		let kind = "tableau";
		if (to.pile === "foundation") kind = "foundation";
		else if (from.pile === "waste") kind = "waste";
		else if (from.pile === "tableau" && from.cardIndex > 0 && !state.tableau[from.index][from.cardIndex - 1].faceUp) kind = "reveal";
		moves.push({
			from,
			to,
			kind
		});
	};
	if (state.waste.length > 0) {
		const from = { pile: "waste" };
		for (let i = 0; i < 4; i++) consider(from, {
			pile: "foundation",
			index: i
		});
		for (let i = 0; i < 7; i++) consider(from, {
			pile: "tableau",
			index: i
		});
	}
	for (let f = 0; f < 4; f++) {
		if (state.foundations[f].length === 0) continue;
		const from = {
			pile: "foundation",
			index: f
		};
		for (let i = 0; i < 7; i++) consider(from, {
			pile: "tableau",
			index: i
		});
	}
	for (let col = 0; col < 7; col++) {
		const pile = state.tableau[col];
		for (let cardIndex = 0; cardIndex < pile.length; cardIndex++) {
			if (!pile[cardIndex].faceUp) continue;
			const from = {
				pile: "tableau",
				index: col,
				cardIndex
			};
			if (!getSourceCards(state, from)) continue;
			for (let i = 0; i < 4; i++) consider(from, {
				pile: "foundation",
				index: i
			});
			for (let i = 0; i < 7; i++) consider(from, {
				pile: "tableau",
				index: i
			});
		}
	}
	return moves;
}
function findHint(state) {
	const moves = listLegalMoves(state);
	for (const kind of [
		"foundation",
		"reveal",
		"waste",
		"tableau"
	]) {
		const hit = moves.find((move) => move.kind === kind);
		if (hit) return {
			from: hit.from,
			to: hit.to
		};
	}
	if (state.stock.length > 0 || state.waste.length > 0) return "draw";
	return null;
}
function findFoundationStep(state) {
	const tryFrom = (from) => {
		const cards = getSourceCards(state, from);
		if (!cards || cards.length !== 1) return null;
		for (let i = 0; i < 4; i++) {
			const to = {
				pile: "foundation",
				index: i
			};
			if (tryMove(state, from, to)) return {
				from,
				to
			};
		}
		return null;
	};
	if (state.waste.length > 0) {
		const hit = tryFrom({ pile: "waste" });
		if (hit) return hit;
	}
	for (let col = 0; col < 7; col++) {
		const pile = state.tableau[col];
		if (pile.length === 0) continue;
		const hit = tryFrom({
			pile: "tableau",
			index: col,
			cardIndex: pile.length - 1
		});
		if (hit) return hit;
	}
	return null;
}
function canAutoComplete(state) {
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
function elapsedSeconds(state, now = Date.now()) {
	if (!state.startedAt) return 0;
	const end = state.finishedAt ?? now;
	return Math.max(0, Math.floor((end - state.startedAt) / 1e3));
}
function displayedScore(state, now = Date.now()) {
	if (state.won || !state.startedAt) return state.score;
	const penalty = Math.floor(elapsedSeconds(state, now) / 10) * 2;
	return Math.max(0, state.score - penalty);
}
function parseDropTarget(value) {
	if (!value) return null;
	if (value.startsWith("foundation:")) {
		const index = Number(value.slice(11));
		if (index >= 0 && index < 4) return {
			pile: "foundation",
			index
		};
	}
	if (value.startsWith("tableau:")) {
		const index = Number(value.slice(8));
		if (index >= 0 && index < 7) return {
			pile: "tableau",
			index
		};
	}
	return null;
}
function sourceKey(from) {
	if (from.pile === "waste") return "waste";
	if (from.pile === "foundation") return `foundation:${from.index}`;
	return `tableau:${from.index}:${from.cardIndex}`;
}
function destKey(to) {
	return `${to.pile}:${to.index}`;
}
function sourcesEqual(a, b) {
	if (!a || !b) return a === b;
	return sourceKey(a) === sourceKey(b);
}
function dropMatchesSource(from, to) {
	return samePile(from, to);
}
function measureLayout(width) {
	const gap = width < 400 ? 4 : width < 520 ? 6 : width < 820 ? 8 : 12;
	const cardW = Math.max(40, Math.min(92, Math.floor((width - gap * 6) / 7)));
	const cardH = Math.round(cardW * 1.4);
	const compact = cardW < 64;
	return {
		cardW,
		cardH,
		gap,
		compact,
		downOverlap: Math.max(8, Math.round(cardH * .12)),
		upOverlap: Math.max(compact ? 20 : 22, Math.round(cardH * .3)),
		fan: compact ? 12 : 20
	};
}
function Board({ state, selected, hint, drag, layout, busy, onDraw, onActivate, onDrop, onSlot, onDragChange }) {
	const { cardW, cardH, compact, downOverlap, upOverlap, fan } = layout;
	const hidden = new Set(drag?.cards.map((card) => card.id) ?? []);
	const hintFromKey = hint && hint !== "draw" ? sourceKey(hint.from) : null;
	const hintToKey = hint && hint !== "draw" ? destKey(hint.to) : null;
	const selectedKey = selected ? sourceKey(selected) : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "playfield",
		style: {
			"--card-w": `${cardW}px`,
			"--card-h": `${cardH}px`,
			"--card-radius": `${Math.max(6, Math.round(cardW * .08))}px`,
			"--col-gap": `${layout.gap}px`
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "top-row",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "top-left",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StockPile, {
						count: state.stock.length,
						wasteCount: state.waste.length,
						hinted: hint === "draw",
						disabled: busy,
						onDraw
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WastePile, {
						waste: state.waste,
						drawCount: state.drawCount,
						fan,
						compact,
						hidden,
						selected: selectedKey === "waste",
						hinted: hintFromKey === "waste",
						disabled: busy,
						onActivate,
						onDragChange,
						onDrop
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "foundations",
					children: state.foundations.map((pile, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FoundationPile, {
						index,
						pile,
						compact,
						hidden,
						selected: selectedKey === `foundation:${index}`,
						hintedFrom: hintFromKey === `foundation:${index}`,
						hintedTo: hintToKey === `foundation:${index}`,
						disabled: busy,
						onActivate,
						onSlot,
						onDragChange,
						onDrop
					}, index))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "tableau",
				children: state.tableau.map((col, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableauColumn, {
					index,
					cards: col,
					cardH,
					compact,
					downOverlap,
					upOverlap,
					hidden,
					selected,
					hintFromKey,
					hintedTo: hintToKey === `tableau:${index}`,
					disabled: busy,
					onActivate,
					onSlot,
					onDragChange,
					onDrop
				}, index))
			}),
			drag && drag.cards.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DragGhost, {
				drag,
				compact,
				upOverlap
			}) : null
		]
	});
}
function StockPile({ count, wasteCount, hinted, disabled, onDraw }) {
	const canDraw = count > 0 || wasteCount > 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		className: cn("pile-box", hinted && "is-hinted"),
		"aria-label": count > 0 ? `Draw cards, ${count} remaining` : wasteCount > 0 ? "Redeal stock" : "Empty stock",
		disabled: disabled || !canDraw,
		onClick: onDraw,
		children: count > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardBack, {}), count > 6 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "stack-nudge" }) : null] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptySlot, { children: wasteCount > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "size-5 text-cream/35" }) : null })
	});
}
function WastePile({ waste, drawCount, fan, compact, hidden, selected, hinted, disabled, onActivate, onDragChange, onDrop }) {
	const visible = waste.slice(Math.max(0, waste.length - (drawCount === 3 ? 3 : 1)));
	const width = `calc(var(--card-w) + ${Math.max(0, visible.length - 1) * fan}px)`;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative",
		style: {
			width,
			height: "var(--card-h)"
		},
		children: [waste.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptySlot, {}) : null, visible.map((card, i) => {
			const isTop = i === visible.length - 1;
			const isHidden = hidden.has(card.id);
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute top-0",
				style: {
					left: i * fan,
					width: "var(--card-w)",
					height: "var(--card-h)"
				},
				children: [isHidden ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardView, {
					card,
					compact,
					selected: isTop && selected,
					hinted: isTop && hinted
				}), isTop && !disabled ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hit, {
					label: cardLabel(card),
					from: { pile: "waste" },
					onActivate,
					onDragChange,
					onDrop
				}) : null]
			}, card.id);
		})]
	});
}
function FoundationPile({ index, pile, compact, hidden, selected, hintedFrom, hintedTo, disabled, onActivate, onSlot, onDragChange, onDrop }) {
	const top = pile[pile.length - 1];
	const dest = {
		pile: "foundation",
		index
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-drop": `foundation:${index}`,
		className: cn("pile-box", hintedTo && "is-hinted-dest"),
		children: [top && !hidden.has(top.id) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardView, {
			card: top,
			compact,
			selected,
			hinted: hintedFrom
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptySlot, {}), top && !disabled ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hit, {
			label: cardLabel(top),
			from: {
				pile: "foundation",
				index
			},
			onActivate,
			onDragChange,
			onDrop
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			className: "card-hit",
			"aria-label": `Foundation ${index + 1}`,
			disabled,
			onClick: () => onSlot(dest)
		})]
	});
}
function TableauColumn({ index, cards, cardH, compact, downOverlap, upOverlap, hidden, selected, hintFromKey, hintedTo, disabled, onActivate, onSlot, onDragChange, onDrop }) {
	const offsets = [];
	let top = 0;
	for (let i = 0; i < cards.length; i++) {
		offsets.push(top);
		const card = cards[i];
		if (i < cards.length - 1) top += card.faceUp ? upOverlap : downOverlap;
	}
	const height = cards.length === 0 ? cardH : top + cardH;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		"data-drop": `tableau:${index}`,
		className: cn("tableau-col", hintedTo && "is-hinted-dest"),
		style: { height },
		children: cards.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			className: "pile-box",
			"aria-label": `Empty column ${index + 1}`,
			disabled,
			onClick: () => onSlot({
				pile: "tableau",
				index
			}),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptySlot, {})
		}) : cards.map((card, cardIndex) => {
			const isLast = cardIndex === cards.length - 1;
			const from = {
				pile: "tableau",
				index,
				cardIndex
			};
			const isHidden = hidden.has(card.id);
			const isSelected = selected?.pile === "tableau" && selected.index === index && selected.cardIndex === cardIndex;
			const strip = isLast ? void 0 : card.faceUp ? upOverlap : downOverlap;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute left-0",
				style: {
					top: offsets[cardIndex],
					width: "100%",
					height: "var(--card-h)",
					zIndex: cardIndex
				},
				children: [isHidden ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardView, {
					card,
					compact,
					selected: isSelected,
					hinted: hintFromKey === sourceKey(from)
				}), card.faceUp && !disabled ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hit, {
					label: cardLabel(card),
					from,
					strip,
					onActivate,
					onDragChange,
					onDrop
				}) : null]
			}, card.id);
		})
	});
}
function Hit({ label, from, strip, onActivate, onDragChange, onDrop }) {
	const session = (0, import_react.useRef)(null);
	const end = (event) => {
		const s = session.current;
		if (!s || event.pointerId !== s.pointerId) return;
		session.current = null;
		try {
			event.currentTarget.releasePointerCapture(event.pointerId);
		} catch {}
		if (s.dragging) {
			const drop = document.elementFromPoint(event.clientX, event.clientY)?.closest("[data-drop]");
			const dest = parseDropTarget(drop?.getAttribute("data-drop") ?? null);
			onDragChange(null);
			if (dest && !dropMatchesSource(s.from, dest)) onDrop(s.from, dest);
		} else onActivate(s.from);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		className: "card-hit",
		"aria-label": label,
		style: strip ? {
			height: strip,
			bottom: "auto"
		} : void 0,
		onPointerDown: (event) => {
			if (event.button !== 0) return;
			const rect = event.currentTarget.parentElement?.getBoundingClientRect();
			if (!rect) return;
			event.currentTarget.setPointerCapture(event.pointerId);
			session.current = {
				pointerId: event.pointerId,
				startX: event.clientX,
				startY: event.clientY,
				dragging: false,
				from,
				offsetX: event.clientX - rect.left,
				offsetY: event.clientY - rect.top
			};
		},
		onPointerMove: (event) => {
			const s = session.current;
			if (!s || event.pointerId !== s.pointerId) return;
			const dx = event.clientX - s.startX;
			const dy = event.clientY - s.startY;
			if (!s.dragging && Math.hypot(dx, dy) > 8) s.dragging = true;
			if (s.dragging) {
				const parent = event.currentTarget.parentElement;
				onDragChange({
					from: s.from,
					cards: [],
					x: event.clientX,
					y: event.clientY,
					offsetX: s.offsetX,
					offsetY: s.offsetY,
					originW: parent?.offsetWidth ?? 0,
					originH: parent?.offsetHeight ?? 0
				});
			}
		},
		onPointerUp: end,
		onPointerCancel: end
	});
}
function DragGhost({ drag, compact, upOverlap }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "drag-ghost",
		style: {
			left: drag.x - drag.offsetX,
			top: drag.y - drag.offsetY,
			width: drag.originW
		},
		children: drag.cards.map((card, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "relative",
			style: {
				width: drag.originW,
				height: drag.originH,
				marginTop: i === 0 ? 0 : -(drag.originH - upOverlap),
				zIndex: i
			},
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardView, {
				card,
				compact
			})
		}, card.id))
	});
}
function useBoardLayout(ref) {
	const [layout, setLayout] = (0, import_react.useState)(() => measureLayout(720));
	(0, import_react.useEffect)(() => {
		const el = ref.current;
		if (!el) return;
		const apply = (width) => {
			setLayout(measureLayout(Math.max(280, Math.floor(width) - 1)));
		};
		apply(el.clientWidth);
		const ro = new ResizeObserver((entries) => {
			const width = entries[0]?.contentRect.width ?? el.clientWidth;
			apply(width);
		});
		ro.observe(el);
		return () => ro.disconnect();
	}, [ref]);
	return layout;
}
function fillDragCards(state, drag) {
	if (!drag) return null;
	const cards = getSourceCards(state, drag.from);
	if (!cards) return drag;
	return {
		...drag,
		cards
	};
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-[opacity,transform,background-color,color] duration-[var(--motion-quick)] ease-[var(--ease-out)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream/40 disabled:pointer-events-none disabled:opacity-40 active:scale-[0.98]", {
	variants: {
		variant: {
			default: "bg-cream text-ink hover:bg-cream/90",
			ghost: "text-cream/80 hover:bg-cream/10 hover:text-cream",
			outline: "border border-cream/15 bg-transparent text-cream hover:bg-cream/10",
			subtle: "bg-cream/10 text-cream hover:bg-cream/16"
		},
		size: {
			default: "h-11 px-4",
			sm: "h-9 px-3 text-[0.8125rem]",
			icon: "size-11",
			"icon-sm": "size-9"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
function Button({ className, variant, size, asChild = false, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		...props
	});
}
function Hud({ time, moves, score, canUndo, canComplete, sound, drawCount, onNew, onUndo, onHint, onComplete, onToggleSound, onDrawCount, onHelp }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "hud",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-baseline gap-3 min-w-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-xl font-semibold tracking-tight text-cream sm:text-2xl",
					children: "Klondike"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "hidden text-xs tracking-wide text-muted uppercase sm:block",
					children: "Solitaire"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
				className: "hud-stats",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Time" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
						className: "tabular-nums",
						children: formatTime(time)
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Moves" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
						className: "tabular-nums",
						children: moves
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Score" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
						className: "tabular-nums",
						children: score
					})] })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "hud-actions",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "subtle",
						size: "sm",
						onClick: onNew,
						children: "New"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "icon-sm",
						"aria-label": "Undo",
						disabled: !canUndo,
						onClick: onUndo,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Undo2, { className: "size-4" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "icon-sm",
						"aria-label": "Hint",
						onClick: onHint,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lightbulb, { className: "size-4" })
					}),
					canComplete ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "subtle",
						size: "sm",
						onClick: onComplete,
						children: "Finish"
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "draw-toggle",
						role: "group",
						"aria-label": "Cards drawn",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: cn(drawCount === 1 && "is-active"),
							onClick: () => onDrawCount(1),
							children: "1"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: cn(drawCount === 3 && "is-active"),
							onClick: () => onDrawCount(3),
							children: "3"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "icon-sm",
						"aria-label": sound ? "Mute sound" : "Unmute sound",
						onClick: onToggleSound,
						children: sound ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeX, { className: "size-4" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "icon-sm",
						"aria-label": "How to play",
						onClick: onHelp,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleHelp, { className: "size-4" })
					})
				]
			})
		]
	});
}
function WinOverlay({ time, moves, score, stats, onAgain }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "overlay",
		role: "dialog",
		"aria-labelledby": "win-title",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "overlay-card win-card",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs tracking-[0.2em] text-muted uppercase",
					children: "Cleared"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					id: "win-title",
					className: "font-display text-4xl font-semibold tracking-tight text-cream",
					children: "Klondike"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
					className: "mt-5 grid grid-cols-3 gap-3 text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
							className: "text-xs text-muted",
							children: "Time"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
							className: "mt-1 font-display text-xl text-cream tabular-nums",
							children: formatTime(time)
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
							className: "text-xs text-muted",
							children: "Moves"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
							className: "mt-1 font-display text-xl text-cream tabular-nums",
							children: moves
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
							className: "text-xs text-muted",
							children: "Score"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
							className: "mt-1 font-display text-xl text-cream tabular-nums",
							children: score
						})] })
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-4 text-sm text-muted",
					children: [
						stats.won,
						" win",
						stats.won === 1 ? "" : "s",
						stats.bestTime !== null ? ` · best ${formatTime(stats.bestTime)}` : "",
						stats.currentStreak > 1 ? ` · streak ${stats.currentStreak}` : ""
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					className: "mt-6 w-full",
					onClick: onAgain,
					children: "Play again"
				})
			]
		})
	});
}
function HelpOverlay({ stats, onClose }) {
	const rate = stats.played > 0 ? Math.round(stats.won / stats.played * 100) : 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "overlay",
		role: "dialog",
		"aria-labelledby": "help-title",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "overlay-card",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					id: "help-title",
					className: "font-display text-2xl font-semibold tracking-tight text-cream",
					children: "How to play"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "mt-4 space-y-2 text-sm leading-relaxed text-cream/80",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Build four foundations up by suit, Ace through King." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "On the table, stack cards down in alternating colors." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Only a King may fill an empty column." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Tap the deck to draw. Switch 1 or 3 cards at the top." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Drag a card or a face-up run. Tap to send it if there is one clear home." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Keyboard: space draws, U undoes, H hints, N starts a new game." })
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
					className: "mt-5 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "Played",
							value: stats.played
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "Won",
							value: `${stats.won}${stats.played ? ` · ${rate}%` : ""}`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "Best",
							value: stats.bestTime === null ? "—" : formatTime(stats.bestTime)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "Streak",
							value: stats.currentStreak
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					className: "mt-6 w-full",
					variant: "outline",
					onClick: onClose,
					children: "Close"
				})
			]
		})
	});
}
function Stat({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl bg-cream/5 px-3 py-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
			className: "text-xs text-muted",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
			className: "mt-0.5 text-cream tabular-nums",
			children: value
		})]
	});
}
function ConfirmNew({ onConfirm, onCancel }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "overlay",
		role: "dialog",
		"aria-labelledby": "new-title",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "overlay-card max-w-sm",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					id: "new-title",
					className: "font-display text-2xl font-semibold tracking-tight text-cream",
					children: "New game?"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-cream/75",
					children: "This deal still has moves. Starting over will reset the streak if you have already begun."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						className: "flex-1",
						onClick: onCancel,
						children: "Keep playing"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "flex-1",
						onClick: onConfirm,
						children: "Deal again"
					})]
				})
			]
		})
	});
}
function Toast({ text, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("toast", className),
		role: "status",
		children: text
	});
}
function Confetti({ active }) {
	if (!active) return null;
	const bits = Array.from({ length: 28 }, (_, i) => i);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "confetti",
		"aria-hidden": "true",
		children: bits.map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: {
			left: `${4 + i * 37 % 92}%`,
			animationDelay: `${i % 8 * 70}ms`,
			animationDuration: `${1400 + i % 5 * 220}ms`,
			background: i % 3 === 0 ? "#f4ead8" : i % 3 === 1 ? "#b4232a" : "#1a4a38",
			width: i % 2 === 0 ? 8 : 6,
			height: i % 2 === 0 ? 12 : 8
		} }, i))
	});
}
var ctx = null;
var master = null;
var enabled = true;
function ensureContext() {
	if (typeof window === "undefined") return null;
	const Ctor = window.AudioContext || window.webkitAudioContext;
	if (!Ctor) return null;
	if (!ctx) {
		ctx = new Ctor({ latencyHint: "interactive" });
		master = ctx.createGain();
		master.gain.value = enabled ? .7 : 0;
		master.connect(ctx.destination);
	}
	return ctx;
}
function unlockAudio() {
	const audio = ensureContext();
	if (!audio) return;
	if (audio.state === "suspended") audio.resume();
}
function setSoundEnabled(value) {
	enabled = value;
	if (master && ctx) master.gain.setTargetAtTime(value ? .7 : 0, ctx.currentTime, .02);
}
function envGain(audio, duration, peak = .12) {
	const gain = audio.createGain();
	const now = audio.currentTime;
	gain.gain.setValueAtTime(0, now);
	gain.gain.linearRampToValueAtTime(peak, now + .008);
	gain.gain.exponentialRampToValueAtTime(1e-4, now + duration);
	if (master) gain.connect(master);
	return gain;
}
function tone(audio, freq, duration, type = "sine", peak = .1, delay = 0) {
	const osc = audio.createOscillator();
	osc.type = type;
	osc.frequency.setValueAtTime(freq, audio.currentTime + delay);
	const gain = envGain(audio, duration, peak);
	osc.connect(gain);
	osc.start(audio.currentTime + delay);
	osc.stop(audio.currentTime + delay + duration + .02);
	osc.onended = () => {
		osc.disconnect();
		gain.disconnect();
	};
}
function noiseBurst(audio, duration, peak = .04) {
	const length = Math.floor(audio.sampleRate * duration);
	const buffer = audio.createBuffer(1, length, audio.sampleRate);
	const data = buffer.getChannelData(0);
	for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / length);
	const src = audio.createBufferSource();
	src.buffer = buffer;
	const filter = audio.createBiquadFilter();
	filter.type = "bandpass";
	filter.frequency.value = 1400;
	filter.Q.value = .7;
	const gain = envGain(audio, duration, peak);
	src.connect(filter);
	filter.connect(gain);
	src.start();
	src.stop(audio.currentTime + duration + .02);
	src.onended = () => {
		src.disconnect();
		filter.disconnect();
		gain.disconnect();
	};
}
function playSfx(name) {
	if (!enabled) return;
	const audio = ensureContext();
	if (!audio) return;
	if (audio.state === "suspended") audio.resume();
	const jitter = .94 + Math.random() * .12;
	switch (name) {
		case "place":
			tone(audio, 190 * jitter, .07, "sine", .08);
			noiseBurst(audio, .04, .03);
			break;
		case "draw":
			noiseBurst(audio, .07, .045);
			tone(audio, 240 * jitter, .05, "triangle", .04);
			break;
		case "flip":
			tone(audio, 520 * jitter, .04, "square", .03);
			tone(audio, 320 * jitter, .05, "triangle", .04, .03);
			break;
		case "deal":
			noiseBurst(audio, .05, .025);
			break;
		case "illegal":
			tone(audio, 110, .12, "sine", .06);
			break;
		case "win":
			tone(audio, 261.63, .16, "sine", .07, 0);
			tone(audio, 329.63, .16, "sine", .07, .12);
			tone(audio, 392, .16, "sine", .07, .24);
			tone(audio, 523.25, .28, "sine", .08, .38);
	}
}
var KEY = "klondike.v1";
var SAVE_VERSION = 1;
var defaultSettings = {
	drawCount: 1,
	sound: true
};
var defaultStats = {
	played: 0,
	won: 0,
	bestTime: null,
	currentStreak: 0,
	bestStreak: 0
};
function isCard(value) {
	if (!value || typeof value !== "object") return false;
	const card = value;
	return typeof card.id === "string" && typeof card.suit === "string" && typeof card.rank === "number" && typeof card.faceUp === "boolean";
}
function isState(value) {
	if (!value || typeof value !== "object") return false;
	const s = value;
	return Array.isArray(s.stock) && Array.isArray(s.waste) && Array.isArray(s.foundations) && s.foundations.length === 4 && Array.isArray(s.tableau) && s.tableau.length === 7 && (s.drawCount === 1 || s.drawCount === 3) && typeof s.moves === "number" && typeof s.score === "number" && typeof s.won === "boolean" && typeof s.seed === "number" && s.stock.every(isCard) && s.waste.every(isCard);
}
function loadSnapshot() {
	try {
		const raw = localStorage.getItem(KEY);
		if (!raw) return null;
		const parsed = JSON.parse(raw);
		if (parsed.version !== SAVE_VERSION || !parsed.state || !isState(parsed.state)) return null;
		return {
			version: SAVE_VERSION,
			state: parsed.state,
			history: Array.isArray(parsed.history) ? parsed.history.filter(isState).slice(-40) : [],
			settings: {
				drawCount: parsed.settings?.drawCount === 3 ? 3 : 1,
				sound: parsed.settings?.sound !== false
			},
			stats: {
				...defaultStats,
				...parsed.stats
			}
		};
	} catch {
		return null;
	}
}
function saveSnapshot(snapshot) {
	try {
		const payload = {
			...snapshot,
			history: snapshot.history.slice(-40)
		};
		localStorage.setItem(KEY, JSON.stringify(payload));
	} catch {}
}
function recordWin(stats, timeSeconds) {
	const currentStreak = stats.currentStreak + 1;
	return {
		played: stats.played,
		won: stats.won + 1,
		bestTime: stats.bestTime === null ? timeSeconds : Math.min(stats.bestTime, timeSeconds),
		currentStreak,
		bestStreak: Math.max(stats.bestStreak, currentStreak)
	};
}
function recordLossStreak(stats) {
	return {
		...stats,
		currentStreak: 0
	};
}
function recordPlayed(stats, already) {
	if (already) return stats;
	return {
		...stats,
		played: stats.played + 1
	};
}
function destOf(from) {
	if (from.pile === "waste") return null;
	if (from.pile === "foundation") return {
		pile: "foundation",
		index: from.index
	};
	return {
		pile: "tableau",
		index: from.index
	};
}
function Game() {
	const [state, setState] = (0, import_react.useState)(() => createGame({
		seed: 1,
		drawCount: 1
	}));
	const [history, setHistory] = (0, import_react.useState)([]);
	const [settings, setSettings] = (0, import_react.useState)(defaultSettings);
	const [stats, setStats] = (0, import_react.useState)(defaultStats);
	const [selected, setSelected] = (0, import_react.useState)(null);
	const [drag, setDrag] = (0, import_react.useState)(null);
	const [hint, setHint] = (0, import_react.useState)(null);
	const [help, setHelp] = (0, import_react.useState)(false);
	const [confirmNew, setConfirmNew] = (0, import_react.useState)(null);
	const [toast, setToast] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [now, setNow] = (0, import_react.useState)(() => Date.now());
	const [winRecorded, setWinRecorded] = (0, import_react.useState)(false);
	const boardRef = (0, import_react.useRef)(null);
	const layout = useBoardLayout(boardRef);
	const hintTimer = (0, import_react.useRef)(0);
	const toastTimer = (0, import_react.useRef)(0);
	const completeRef = (0, import_react.useRef)(false);
	const [hydrated, setHydrated] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const snap = loadSnapshot();
		if (snap) {
			setState(snap.state);
			setHistory(snap.history);
			setSettings(snap.settings);
			setStats(snap.stats);
			setWinRecorded(snap.state.won);
			setSoundEnabled(snap.settings.sound);
		}
		setHydrated(true);
	}, []);
	const snapshot = (0, import_react.useMemo)(() => ({
		version: 1,
		state,
		history,
		settings,
		stats
	}), [
		state,
		history,
		settings,
		stats
	]);
	(0, import_react.useEffect)(() => {
		if (!hydrated) return;
		saveSnapshot(snapshot);
	}, [hydrated, snapshot]);
	(0, import_react.useEffect)(() => {
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
	(0, import_react.useEffect)(() => {
		if (!state.startedAt || state.won) return;
		let raf = 0;
		const tick = () => {
			const t = Date.now();
			setNow((prev) => Math.floor(prev / 1e3) === Math.floor(t / 1e3) ? prev : t);
			raf = requestAnimationFrame(tick);
		};
		raf = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(raf);
	}, [state.startedAt, state.won]);
	const showToast = (0, import_react.useCallback)((text) => {
		setToast(text);
		window.clearTimeout(toastTimer.current);
		toastTimer.current = window.setTimeout(() => setToast(null), 1800);
	}, []);
	const commit = (0, import_react.useCallback)((next, sfx) => {
		setHistory((h) => [...h.slice(-39), cloneState(state)]);
		if (next.sessionCounted && !state.sessionCounted) setStats((s) => recordPlayed(s, false));
		if (next.won && !state.won && !winRecorded) {
			setStats((s) => recordWin(s, elapsedSeconds(next)));
			setWinRecorded(true);
			playSfx("win");
		} else if (sfx) playSfx(sfx);
		setState(next);
		setSelected(null);
		setHint(null);
	}, [state, winRecorded]);
	const dealNew = (0, import_react.useCallback)((drawCount) => {
		if (state.sessionCounted && !state.won) setStats((s) => recordLossStreak(s));
		setState(createGame({
			drawCount,
			dealId: Date.now()
		}));
		setHistory([]);
		setSelected(null);
		setHint(null);
		setWinRecorded(false);
		setConfirmNew(null);
		playSfx("deal");
	}, [state.sessionCounted, state.won]);
	const requestNew = (0, import_react.useCallback)((drawCount) => {
		unlockAudio();
		const nextDraw = drawCount ?? settings.drawCount;
		if (state.moves > 0 && !state.won) {
			setConfirmNew(drawCount ?? "new");
			return;
		}
		if (drawCount) setSettings((s) => ({
			...s,
			drawCount
		}));
		dealNew(nextDraw);
	}, [
		dealNew,
		settings.drawCount,
		state.moves,
		state.won
	]);
	const handleDraw = (0, import_react.useCallback)(() => {
		if (busy) return;
		unlockAudio();
		const next = draw(state);
		if (!next) {
			playSfx("illegal");
			return;
		}
		commit(next, state.stock.length === 0 ? "flip" : "draw");
	}, [
		busy,
		commit,
		state
	]);
	const handleMove = (0, import_react.useCallback)((from, to, quiet = false) => {
		if (busy) return false;
		unlockAudio();
		const next = tryMove(state, from, to);
		if (!next) {
			if (!quiet) playSfx("illegal");
			return false;
		}
		const flipped = from.pile === "tableau" && state.tableau[from.index][from.cardIndex - 1] && !state.tableau[from.index][from.cardIndex - 1].faceUp;
		commit(next, flipped ? "flip" : "place");
		return true;
	}, [
		busy,
		commit,
		state
	]);
	const handleActivate = (0, import_react.useCallback)((from) => {
		if (busy) return;
		unlockAudio();
		if (selected) {
			const onto = destOf(from);
			if (onto && handleMove(selected, onto, true)) return;
		}
		const auto = findAutoMove(state, from);
		if (auto && handleMove(from, auto, true)) return;
		if (isMovable(state, from)) setSelected((prev) => sourcesEqual(prev, from) ? null : from);
	}, [
		busy,
		handleMove,
		selected,
		state
	]);
	const handleSlot = (0, import_react.useCallback)((to) => {
		if (busy || !selected) return;
		handleMove(selected, to);
	}, [
		busy,
		handleMove,
		selected
	]);
	const handleUndo = (0, import_react.useCallback)(() => {
		if (busy || history.length === 0 || state.won) return;
		unlockAudio();
		const prev = history[history.length - 1];
		setHistory((h) => h.slice(0, -1));
		setState(prev);
		setSelected(null);
		setHint(null);
		playSfx("flip");
	}, [
		busy,
		history,
		state.won
	]);
	const handleHint = (0, import_react.useCallback)(() => {
		unlockAudio();
		const next = findHint(state);
		if (!next) {
			showToast("No more moves");
			playSfx("illegal");
			return;
		}
		setHint(next);
		window.clearTimeout(hintTimer.current);
		hintTimer.current = window.setTimeout(() => setHint(null), 1600);
	}, [showToast, state]);
	const runComplete = (0, import_react.useCallback)(async () => {
		if (busy || completeRef.current) return;
		completeRef.current = true;
		setBusy(true);
		setSelected(null);
		let cursor = state;
		let guard = 0;
		while (guard < 64) {
			const step = findFoundationStep(cursor);
			if (!step) break;
			const next = tryMove(cursor, step.from, step.to);
			if (!next) break;
			cursor = next;
			setState(next);
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
	}, [busy, state]);
	(0, import_react.useEffect)(() => {
		const onKey = (event) => {
			const tag = event.target?.tagName;
			if (tag === "INPUT" || tag === "TEXTAREA") return;
			if (event.key === " " || event.code === "Space") {
				event.preventDefault();
				handleDraw();
			} else if (event.key === "u" || event.key === "U") handleUndo();
			else if (event.key === "h" || event.key === "H") handleHint();
			else if (event.key === "n" || event.key === "N") requestNew();
			else if (event.key === "Escape") {
				setSelected(null);
				setHelp(false);
				setConfirmNew(null);
			}
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [
		handleDraw,
		handleHint,
		handleUndo,
		requestNew
	]);
	const filledDrag = fillDragCards(state, drag);
	const time = elapsedSeconds(state, now);
	const score = displayedScore(state, now);
	const finishable = canAutoComplete(state);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "table-shell",
		onPointerDown: unlockAudio,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hud, {
				time,
				moves: state.moves,
				score,
				canUndo: history.length > 0 && !state.won,
				canComplete: finishable && !busy,
				sound: settings.sound,
				drawCount: settings.drawCount,
				onNew: () => requestNew(),
				onUndo: handleUndo,
				onHint: handleHint,
				onComplete: () => void runComplete(),
				onToggleSound: () => {
					unlockAudio();
					setSettings((s) => {
						const sound = !s.sound;
						setSoundEnabled(sound);
						return {
							...s,
							sound
						};
					});
				},
				onDrawCount: (n) => {
					if (n === settings.drawCount) return;
					requestNew(n);
				},
				onHelp: () => setHelp(true)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: "table-main",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					ref: boardRef,
					className: "h-full w-full",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Board, {
						state,
						selected,
						hint,
						drag: filledDrag,
						layout,
						busy,
						onDraw: handleDraw,
						onActivate: handleActivate,
						onDrop: handleMove,
						onSlot: handleSlot,
						onDragChange: setDrag
					})
				})
			}),
			toast ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toast, { text: toast }) : null,
			help ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HelpOverlay, {
				stats,
				onClose: () => setHelp(false)
			}) : null,
			confirmNew ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmNew, {
				onCancel: () => setConfirmNew(null),
				onConfirm: () => {
					const n = confirmNew === 1 || confirmNew === 3 ? confirmNew : settings.drawCount;
					setSettings((s) => ({
						...s,
						drawCount: n
					}));
					dealNew(n);
				}
			}) : null,
			state.won ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Confetti, { active: true }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WinOverlay, {
				time,
				moves: state.moves,
				score: state.score,
				stats,
				onAgain: () => dealNew(settings.drawCount)
			})] }) : null
		]
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Game, {});
}
//#endregion
export { Home as component };
