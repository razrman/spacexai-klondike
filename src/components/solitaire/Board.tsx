import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from "react";
import { RotateCcw } from "lucide-react";
import { CardBack, CardView, EmptySlot } from "./CardView";
import { SuitIcon } from "./Suits";
import {
  destKey,
  dropMatchesSource,
  foundationSuit,
  getSourceCards,
  parseDropTarget,
  sourceKey,
} from "@/lib/solitaire/engine";
import {
  cardLabel,
  isRed,
  SUIT_LABEL,
  type Card,
  type Dest,
  type GameState,
  type Source,
} from "@/lib/solitaire/types";
import { cn } from "@/lib/utils";

export type DragState = {
  from: Source;
  cards: Card[];
  x: number;
  y: number;
  offsetX: number;
  offsetY: number;
  originW: number;
  originH: number;
};

export type Layout = {
  cardW: number;
  cardH: number;
  gap: number;
  compact: boolean;
  downOverlap: number;
  upOverlap: number;
  fan: number;
};

export function measureLayout(width: number): Layout {
  const gap = width < 400 ? 4 : width < 520 ? 6 : width < 820 ? 8 : 12;
  const cardW = Math.max(40, Math.min(92, Math.floor((width - gap * 6) / 7)));
  const cardH = Math.round(cardW * 1.4);
  const compact = cardW < 64;
  return {
    cardW,
    cardH,
    gap,
    compact,
    downOverlap: 10,
    upOverlap: 25,
    fan: compact ? 12 : 20,
  };
}

export function Board({
  state,
  selected,
  hint,
  drag,
  layout,
  busy,
  onDraw,
  onActivate,
  onDrop,
  onSlot,
  onDragChange,
}: {
  state: GameState;
  selected: Source | null;
  hint: { from: Source; to: Dest } | "draw" | null;
  drag: DragState | null;
  layout: Layout;
  busy: boolean;
  onDraw: () => void;
  onActivate: (from: Source) => void;
  onDrop: (from: Source, to: Dest) => boolean;
  onSlot: (to: Dest) => void;
  onDragChange: (drag: DragState | null) => void;
}) {
  const { cardW, cardH, compact, downOverlap, upOverlap, fan } = layout;
  const hidden = new Set(drag?.cards.map((card) => card.id) ?? []);
  const hintFromKey = hint && hint !== "draw" ? sourceKey(hint.from) : null;
  const hintToKey = hint && hint !== "draw" ? destKey(hint.to) : null;
  const selectedKey = selected ? sourceKey(selected) : null;

  return (
    <div
      className="playfield"
      style={
        {
          "--card-w": `${cardW}px`,
          "--card-h": `${cardH}px`,
          "--card-radius": `${Math.max(6, Math.round(cardW * 0.08))}px`,
          "--col-gap": `${layout.gap}px`,
        } as CSSProperties
      }
    >
      <div className="top-row">
        <div className="top-left">
          <StockPile
            count={state.stock.length}
            wasteCount={state.waste.length}
            hinted={hint === "draw"}
            disabled={busy}
            onDraw={onDraw}
          />
          <WastePile
            waste={state.waste}
            drawCount={state.drawCount}
            fan={fan}
            compact={compact}
            hidden={hidden}
            selected={selectedKey === "waste"}
            hinted={hintFromKey === "waste"}
            disabled={busy}
            onActivate={onActivate}
            onDragChange={onDragChange}
            onDrop={onDrop}
          />
        </div>
        <div className="foundations">
          {state.foundations.map((pile, index) => (
            <FoundationPile
              key={index}
              index={index}
              pile={pile}
              compact={compact}
              hidden={hidden}
              selected={selectedKey === `foundation:${index}`}
              hintedFrom={hintFromKey === `foundation:${index}`}
              hintedTo={hintToKey === `foundation:${index}`}
              disabled={busy}
              onActivate={onActivate}
              onSlot={onSlot}
              onDragChange={onDragChange}
              onDrop={onDrop}
            />
          ))}
        </div>
      </div>

      <div className="tableau">
        {state.tableau.map((col, index) => (
          <TableauColumn
            key={index}
            index={index}
            cards={col}
            cardH={cardH}
            compact={compact}
            downOverlap={downOverlap}
            upOverlap={upOverlap}
            hidden={hidden}
            selected={selected}
            hintFromKey={hintFromKey}
            hintedTo={hintToKey === `tableau:${index}`}
            disabled={busy}
            onActivate={onActivate}
            onSlot={onSlot}
            onDragChange={onDragChange}
            onDrop={onDrop}
          />
        ))}
      </div>

      {drag && drag.cards.length > 0 ? (
        <DragGhost drag={drag} compact={compact} upOverlap={upOverlap} />
      ) : null}
    </div>
  );
}

function StockPile({
  count,
  wasteCount,
  hinted,
  disabled,
  onDraw,
}: {
  count: number;
  wasteCount: number;
  hinted: boolean;
  disabled: boolean;
  onDraw: () => void;
}) {
  const canDraw = count > 0 || wasteCount > 0;
  return (
    <button
      type="button"
      className={cn("pile-box", hinted && "is-hinted")}
      aria-label={
        count > 0
          ? `Draw cards, ${count} remaining`
          : wasteCount > 0
            ? "Redeal stock"
            : "Empty stock"
      }
      disabled={disabled || !canDraw}
      onClick={onDraw}
    >
      {count > 0 ? (
        <>
          <CardBack />
          {count > 6 ? <span className="stack-nudge" /> : null}
        </>
      ) : (
        <EmptySlot>
          {wasteCount > 0 ? (
            <RotateCcw className="size-5 text-cream/35" />
          ) : null}
        </EmptySlot>
      )}
    </button>
  );
}

function WastePile({
  waste,
  drawCount,
  fan,
  compact,
  hidden,
  selected,
  hinted,
  disabled,
  onActivate,
  onDragChange,
  onDrop,
}: {
  waste: Card[];
  drawCount: 1 | 3;
  fan: number;
  compact: boolean;
  hidden: Set<string>;
  selected: boolean;
  hinted: boolean;
  disabled: boolean;
  onActivate: (from: Source) => void;
  onDragChange: (drag: DragState | null) => void;
  onDrop: (from: Source, to: Dest) => boolean;
}) {
  const visible = waste.slice(
    Math.max(0, waste.length - (drawCount === 3 ? 3 : 1)),
  );
  const width = `calc(var(--card-w) + ${Math.max(0, visible.length - 1) * fan}px)`;
  return (
    <div className="relative" style={{ width, height: "var(--card-h)" }}>
      {waste.length === 0 ? <EmptySlot /> : null}
      {visible.map((card, i) => {
        const isTop = i === visible.length - 1;
        const isHidden = hidden.has(card.id);
        return (
          <div
            key={card.id}
            className="absolute top-0"
            style={{
              left: i * fan,
              width: "var(--card-w)",
              height: "var(--card-h)",
            }}
          >
            {isHidden ? null : (
              <CardView
                card={card}
                compact={compact}
                selected={isTop && selected}
                hinted={isTop && hinted}
              />
            )}
            {isTop && !disabled ? (
              <Hit
                label={cardLabel(card)}
                from={{ pile: "waste" }}
                onActivate={onActivate}
                onDragChange={onDragChange}
                onDrop={onDrop}
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function FoundationPile({
  index,
  pile,
  compact,
  hidden,
  selected,
  hintedFrom,
  hintedTo,
  disabled,
  onActivate,
  onSlot,
  onDragChange,
  onDrop,
}: {
  index: number;
  pile: Card[];
  compact: boolean;
  hidden: Set<string>;
  selected: boolean;
  hintedFrom: boolean;
  hintedTo: boolean;
  disabled: boolean;
  onActivate: (from: Source) => void;
  onSlot: (to: Dest) => void;
  onDragChange: (drag: DragState | null) => void;
  onDrop: (from: Source, to: Dest) => boolean;
}) {
  const top = pile[pile.length - 1];
  const dest: Dest = { pile: "foundation", index };
  const suit = foundationSuit(index);
  return (
    <div
      data-drop={`foundation:${index}`}
      className={cn("pile-box", hintedTo && "is-hinted-dest")}
    >
      {top && !hidden.has(top.id) ? (
        <CardView
          card={top}
          compact={compact}
          selected={selected}
          hinted={hintedFrom}
        />
      ) : (
        <EmptySlot>
          <SuitIcon
            suit={suit}
            className={cn("foundation-mark", isRed(suit) && "is-red")}
          />
        </EmptySlot>
      )}
      {top && !disabled ? (
        <Hit
          label={cardLabel(top)}
          from={{ pile: "foundation", index }}
          onActivate={onActivate}
          onDragChange={onDragChange}
          onDrop={onDrop}
        />
      ) : (
        <button
          type="button"
          className="card-hit"
          aria-label={`${SUIT_LABEL[suit]} foundation`}
          disabled={disabled}
          onClick={() => onSlot(dest)}
        />
      )}
    </div>
  );
}

function TableauColumn({
  index,
  cards,
  cardH,
  compact,
  downOverlap,
  upOverlap,
  hidden,
  selected,
  hintFromKey,
  hintedTo,
  disabled,
  onActivate,
  onSlot,
  onDragChange,
  onDrop,
}: {
  index: number;
  cards: Card[];
  cardH: number;
  compact: boolean;
  downOverlap: number;
  upOverlap: number;
  hidden: Set<string>;
  selected: Source | null;
  hintFromKey: string | null;
  hintedTo: boolean;
  disabled: boolean;
  onActivate: (from: Source) => void;
  onSlot: (to: Dest) => void;
  onDragChange: (drag: DragState | null) => void;
  onDrop: (from: Source, to: Dest) => boolean;
}) {
  const offsets: number[] = [];
  let top = 0;
  for (let i = 0; i < cards.length; i++) {
    offsets.push(top);
    const card = cards[i]!;
    if (i < cards.length - 1) {
      top += card.faceUp ? upOverlap : downOverlap;
    }
  }
  const height = cards.length === 0 ? cardH : top + cardH;

  return (
    <div
      data-drop={`tableau:${index}`}
      className={cn("tableau-col", hintedTo && "is-hinted-dest")}
      style={{ height }}
    >
      {cards.length === 0 ? (
        <button
          type="button"
          className="pile-box"
          aria-label={`Empty column ${index + 1}`}
          disabled={disabled}
          onClick={() => onSlot({ pile: "tableau", index })}
        >
          <EmptySlot />
        </button>
      ) : (
        cards.map((card, cardIndex) => {
          const isLast = cardIndex === cards.length - 1;
          const from: Source = { pile: "tableau", index, cardIndex };
          const isHidden = hidden.has(card.id);
          const isSelected =
            selected?.pile === "tableau" &&
            selected.index === index &&
            selected.cardIndex === cardIndex;
          const strip = isLast ? undefined : card.faceUp ? upOverlap : downOverlap;
          return (
            <div
              key={card.id}
              className="absolute left-0"
              style={{
                top: offsets[cardIndex],
                width: "var(--card-w)",
                height: "var(--card-h)",
                zIndex: cardIndex,
              }}
            >
              {isHidden ? null : (
                <CardView
                  card={card}
                  compact={compact}
                  selected={isSelected}
                  hinted={hintFromKey === sourceKey(from)}
                />
              )}
              {card.faceUp && !disabled ? (
                <Hit
                  label={cardLabel(card)}
                  from={from}
                  strip={strip}
                  onActivate={onActivate}
                  onDragChange={onDragChange}
                  onDrop={onDrop}
                />
              ) : null}
            </div>
          );
        })
      )}
    </div>
  );
}

function Hit({
  label,
  from,
  strip,
  onActivate,
  onDragChange,
  onDrop,
}: {
  label: string;
  from: Source;
  strip?: number;
  onActivate: (from: Source) => void;
  onDragChange: (drag: DragState | null) => void;
  onDrop: (from: Source, to: Dest) => boolean;
}) {
  const session = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    dragging: boolean;
    from: Source;
    offsetX: number;
    offsetY: number;
  } | null>(null);

  const end = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const s = session.current;
    if (!s || event.pointerId !== s.pointerId) return;
    session.current = null;
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // already released
    }
    if (s.dragging) {
      const el = document.elementFromPoint(event.clientX, event.clientY);
      const drop = el?.closest("[data-drop]");
      const dest = parseDropTarget(drop?.getAttribute("data-drop") ?? null);
      onDragChange(null);
      if (dest && !dropMatchesSource(s.from, dest)) {
        onDrop(s.from, dest);
      }
    } else {
      onActivate(s.from);
    }
  };

  return (
    <button
      type="button"
      className="card-hit"
      aria-label={label}
      style={strip ? { height: strip, bottom: "auto" } : undefined}
      onPointerDown={(event) => {
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
          offsetY: event.clientY - rect.top,
        };
      }}
      onPointerMove={(event) => {
        const s = session.current;
        if (!s || event.pointerId !== s.pointerId) return;
        const dx = event.clientX - s.startX;
        const dy = event.clientY - s.startY;
        if (!s.dragging && Math.hypot(dx, dy) > 8) {
          s.dragging = true;
        }
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
            originH: parent?.offsetHeight ?? 0,
          });
        }
      }}
      onPointerUp={end}
      onPointerCancel={end}
    />
  );
}

function DragGhost({
  drag,
  compact,
  upOverlap,
}: {
  drag: DragState;
  compact: boolean;
  upOverlap: number;
}) {
  return (
    <div
      className="drag-ghost"
      style={{
        left: drag.x - drag.offsetX,
        top: drag.y - drag.offsetY,
        width: drag.originW,
      }}
    >
      {drag.cards.map((card, i) => (
        <div
          key={card.id}
          className="relative"
          style={{
            width: drag.originW,
            height: drag.originH,
            marginTop: i === 0 ? 0 : -(drag.originH - upOverlap),
            zIndex: i,
          }}
        >
          <CardView card={card} compact={compact} />
        </div>
      ))}
    </div>
  );
}

export function useBoardLayout(ref: RefObject<HTMLElement | null>): Layout {
  const [layout, setLayout] = useState<Layout>(() => measureLayout(720));

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const apply = (width: number) => {
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

export function fillDragCards(
  state: GameState,
  drag: DragState | null,
): DragState | null {
  if (!drag) return null;
  const cards = getSourceCards(state, drag.from);
  if (!cards) return drag;
  return { ...drag, cards };
}
