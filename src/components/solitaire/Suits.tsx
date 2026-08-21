import type { Suit } from "@/lib/solitaire/types";
import { cn } from "@/lib/utils";

const PATHS: Record<Suit, string> = {
  spades:
    "M16 2C13.2 8.2 5.5 13.2 5.5 19.2C5.5 23.4 8.8 26.5 12.8 26.5C14.2 26.5 15.3 26.1 16 25.3C16.7 26.1 17.8 26.5 19.2 26.5C23.2 26.5 26.5 23.4 26.5 19.2C26.5 13.2 18.8 8.2 16 2ZM12.4 25.2L16 31.2L19.6 25.2",
  hearts:
    "M16 29.5C16 29.5 4 19.8 4 12.4C4 8.2 7.2 5 11.2 5C13.5 5 15.4 6.1 16 7.8C16.6 6.1 18.5 5 20.8 5C24.8 5 28 8.2 28 12.4C28 19.8 16 29.5 16 29.5Z",
  diamonds: "M16 2.5L28 16L16 29.5L4 16Z",
  clubs:
    "M16 4.2C13.1 4.2 10.8 6.5 10.8 9.4C10.8 11.4 12 13.1 13.7 13.8C12 12.9 9.6 13.4 8.2 15C6.6 16.8 6.8 19.4 8.6 21C9.9 22.1 11.7 22.4 13.3 21.8C12.8 23.2 12.6 24.4 12.4 25.4L16 31L19.6 25.4C19.4 24.4 19.2 23.2 18.7 21.8C20.3 22.4 22.1 22.1 23.4 21C25.2 19.4 25.4 16.8 23.8 15C22.4 13.4 20 12.9 18.3 13.8C20 13.1 21.2 11.4 21.2 9.4C21.2 6.5 18.9 4.2 16 4.2Z",
};

export function SuitIcon({
  suit,
  className,
}: {
  suit: Suit;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("inline-block", className)}
      aria-hidden="true"
      focusable="false"
    >
      <path d={PATHS[suit]} fill="currentColor" />
    </svg>
  );
}
