import { useId, type CSSProperties, type ReactNode } from "react";
import { SuitIcon } from "./Suits";
import { cn } from "@/lib/utils";
import {
  type Card,
  isRed,
  RANK_LABEL,
} from "@/lib/solitaire/types";

const PIP_LAYOUT: Record<number, Array<[number, number]>> = {
  1: [[50, 50]],
  2: [[50, 22], [50, 78]],
  3: [[50, 20], [50, 50], [50, 80]],
  4: [[28, 22], [72, 22], [28, 78], [72, 78]],
  5: [[28, 22], [72, 22], [50, 50], [28, 78], [72, 78]],
  6: [[28, 22], [72, 22], [28, 50], [72, 50], [28, 78], [72, 78]],
  7: [[28, 20], [72, 20], [50, 35], [28, 50], [72, 50], [28, 80], [72, 80]],
  8: [
    [28, 18],
    [72, 18],
    [28, 40],
    [72, 40],
    [28, 60],
    [72, 60],
    [28, 82],
    [72, 82],
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
    [72, 82],
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
    [72, 84],
  ],
};

function CornerMark({
  card,
  compact,
  flipped,
}: {
  card: Card;
  compact: boolean;
  flipped?: boolean;
}) {
  const label = RANK_LABEL[card.rank];
  return (
    <div
      className={cn(
        "absolute flex flex-row items-center leading-none",
        flipped ? "right-[4%] bottom-[3%] rotate-180" : "top-[3%] left-[4%]",
        compact ? "gap-px" : "gap-0.5",
      )}
    >
      <span
        className={cn(
          "font-display font-bold tracking-tight",
          compact ? "text-[1rem]" : "text-[1.25rem]",
          label === "10" && (compact ? "text-[0.78rem]" : "text-[1.05rem]"),
        )}
      >
        {label}
      </span>
      <SuitIcon
        suit={card.suit}
        className={compact ? "size-3.5" : "size-5"}
      />
    </div>
  );
}

function Face({ card, compact }: { card: Card; compact: boolean }) {
  const red = isRed(card.suit);
  const color = red ? "text-suit-red" : "text-suit-black";
  const label = RANK_LABEL[card.rank];
  const pips = PIP_LAYOUT[card.rank];
  const face = card.rank > 10;

  return (
    <div
      className={cn(
        "relative flex h-full w-full flex-col overflow-hidden rounded-[inherit] bg-card text-ink",
        color,
      )}
    >
      <CornerMark card={card} compact={compact} />
      <CornerMark card={card} compact={compact} flipped />

      {compact || !pips || face ? (
        <div className="flex h-full items-center justify-center">
          {face ? (
            <div
              className={cn(
                "flex items-center justify-center rounded-md border border-current/15",
                compact ? "h-[38%] w-[42%]" : "h-[44%] w-[48%]",
              )}
            >
              <span
                className={cn(
                  "font-display font-semibold leading-none",
                  compact ? "text-2xl" : "text-4xl",
                )}
              >
                {label}
              </span>
            </div>
          ) : (
            <SuitIcon
              suit={card.suit}
              className={compact ? "size-8" : "size-12"}
            />
          )}
        </div>
      ) : (
        <div className="absolute inset-[20%_18%]">
          {pips.map(([x, y], i) => (
            <span
              key={`${card.id}-pip-${i}`}
              className="absolute"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                transform: `translate(-50%, -50%) ${y > 55 ? "rotate(180deg)" : ""}`,
              }}
            >
              <SuitIcon
                suit={card.suit}
                className={card.rank === 1 ? "size-12" : "size-5"}
              />
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/** Official xAI geometric wordmark — x, A, and a single tall I. */
function XAIMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 466.04 516.93"
      className={className}
      aria-hidden="true"
      focusable="false"
      fill="currentColor"
    >
      <polygon points="0.12 182.71 234.14 516.92 338.15 516.92 104.13 182.71 0.12 182.71" />
      <polygon points="0 516.92 104.08 516.92 156.08 442.67 104.04 368.34 0 516.92" />
      <polygon points="466.04 0 361.96 0 182.1 256.86 234.15 331.18 466.04 0" />
      <polygon points="380.78 516.92 466.04 516.92 466.04 37.16 380.78 158.92 380.78 516.92" />
    </svg>
  );
}

const STARS: Array<[number, number, number]> = [
  [14, 18, 0.7],
  [28, 12, 0.45],
  [46, 16, 0.6],
  [62, 11, 0.4],
  [78, 19, 0.55],
  [88, 14, 0.35],
  [18, 36, 0.4],
  [84, 34, 0.5],
  [12, 58, 0.35],
  [90, 56, 0.45],
  [16, 86, 0.5],
  [30, 124, 0.4],
  [48, 128, 0.55],
  [70, 122, 0.4],
  [86, 88, 0.35],
  [22, 108, 0.3],
  [80, 108, 0.45],
  [54, 18, 0.3],
  [8, 74, 0.4],
  [94, 74, 0.4],
];

function Back() {
  const uid = useId();
  const glow = `${uid}-glow`;
  const tile = `${uid}-tile`;
  return (
    <div className="relative h-full w-full overflow-hidden rounded-[inherit] bg-back text-cream">
      <svg
        viewBox="0 0 100 140"
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <radialGradient id={glow} cx="50%" cy="50%" r="46%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.22" />
            <stop offset="72%" stopColor="currentColor" stopOpacity="0" />
          </radialGradient>
          <pattern
            id={tile}
            width="18"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <g
              fill="currentColor"
              opacity="0.09"
              transform="translate(3.2,2.2) scale(0.024)"
            >
              <polygon points="0.12 182.71 234.14 516.92 338.15 516.92 104.13 182.71 0.12 182.71" />
              <polygon points="0 516.92 104.08 516.92 156.08 442.67 104.04 368.34 0 516.92" />
              <polygon points="466.04 0 361.96 0 182.1 256.86 234.15 331.18 466.04 0" />
              <polygon points="380.78 516.92 466.04 516.92 466.04 37.16 380.78 158.92 380.78 516.92" />
            </g>
          </pattern>
        </defs>
        <rect width="100" height="140" fill="#0c1f18" />
        <rect width="100" height="140" fill={`url(#${tile})`} />
        <rect width="100" height="140" fill={`url(#${glow})`} />
        {STARS.map(([x, y, r], i) => (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={r}
            fill="currentColor"
            opacity={0.22 + (i % 5) * 0.07}
          />
        ))}
        <ellipse
          cx="50"
          cy="70"
          rx="34"
          ry="40"
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.16"
          strokeWidth="0.6"
        />
        <ellipse
          cx="50"
          cy="70"
          rx="28"
          ry="33"
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.28"
          strokeWidth="0.7"
        />
        <rect
          x="5.5"
          y="5.5"
          width="89"
          height="129"
          rx="5"
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.42"
          strokeWidth="1.15"
        />
        <rect
          x="8.5"
          y="8.5"
          width="83"
          height="123"
          rx="3.4"
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.2"
          strokeWidth="0.65"
        />
      </svg>

      <XAIMark className="absolute top-1/2 left-1/2 w-[52%] -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_0_12px_rgba(244,234,216,0.22)]" />
    </div>
  );
}

export function CardView({
  card,
  compact,
  selected,
  hinted,
  dimmed,
  style,
  className,
}: {
  card: Card;
  compact: boolean;
  selected?: boolean;
  hinted?: boolean;
  dimmed?: boolean;
  style?: CSSProperties;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "card-face pointer-events-none select-none",
        selected && "card-selected",
        hinted && "card-hinted",
        dimmed && "opacity-40",
        className,
      )}
      style={style}
    >
      {card.faceUp ? <Face card={card} compact={compact} /> : <Back />}
    </div>
  );
}

export function CardBack({ className }: { className?: string }) {
  return (
    <div className={cn("card-face pointer-events-none select-none", className)}>
      <Back />
    </div>
  );
}

export function EmptySlot({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div className={cn("card-slot", className)}>
      {children}
    </div>
  );
}
