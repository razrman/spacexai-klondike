# SpaceXAI Klondike

Classic Klondike solitaire on a felt table, with a Starship reentry landing page and SpaceXAI card backs.

## Goals

Build a playable Klondike solitaire game, then add Auto Play and a depth-first search so a deal can be brute-forced for winnability.

DFS walks every legal path. When a line stops, it backtracks to the latest decision in the tree and tries the next untried branch, until the deal is won or every path has been tested.

## Play

- Drag cards, or click a card then its destination.
- Foundations are locked left to right: hearts, clubs, diamonds, spades.
- Draw 3 is the default. Draw 1 allows one pass through the stock; draw 3 allows two.
- On the last draw, 1 or 2 leftover stock cards fan as they are.
- Games, stats, and the move log stay in the browser (`localStorage`).

## Controls

| Control | What it does |
|---|---|
| New | Deal a fresh table (`N`) |
| Undo | Take back the last play (`U`) |
| Hint | Highlight the next useful play (`H`) |
| Auto | Play one move every half second (`A`) |
| DFS | With Auto on, search alternate lines for a win |
| Draw 1 / 3 | Stock flip size |
| Log | Move history with path, move, and choice |

A win drops the cards like the landing-page confetti. If nothing advances the game, **No Move Available** appears. Close it and you can still move cards by hand, including the stock.

## Autoplay

Autoplay prefers moves that advance the deal: aces to the foundation, kings onto empty columns that uncover a card, packs that reveal a facedown card, and tableau consolidations that free a king slot.

Two-card combinations count as one choice:

- Pull a foundation card onto the tableau only so a pack can land on it and flip a hidden card.
- Shift a tableau substack only so the card underneath can go to the foundation.

Foundation cards are not pulled off for their own sake, and kings are not shuffled between empty columns.

## DFS

Turn **DFS** on, then **Auto**. The search plays the current line until it stops, then backtracks to the newest untried card play. Stock flips are not graph nodes. The live tree is centered on **Deal**, grows as paths are tried, and can be dragged and zoomed.

## Develop

```bash
npm install
npm run dev
```

```bash
npm run typecheck
npm run build
```

Stack: TanStack Start, React 19, TypeScript, Tailwind v4, Vite.
