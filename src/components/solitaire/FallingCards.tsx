import { CardBack, CardView } from "./CardView";
import { cn } from "@/lib/utils";
import type { Card, Suit } from "@/lib/solitaire/types";

const FALL: Array<{
  left: string;
  delay: string;
  duration: string;
  tilt: string;
  back: boolean;
  card: Card;
}> = [
  { left: "4%", delay: "0s", duration: "13s", tilt: "-16deg", back: true, card: face("b1", "spades", 13) },
  { left: "11%", delay: "2.1s", duration: "11s", tilt: "12deg", back: false, card: face("h1", "hearts", 1) },
  { left: "18%", delay: "5.4s", duration: "14s", tilt: "-8deg", back: false, card: face("c12", "clubs", 12) },
  { left: "27%", delay: "1.2s", duration: "12s", tilt: "22deg", back: true, card: face("b2", "diamonds", 10) },
  { left: "35%", delay: "7s", duration: "15s", tilt: "-24deg", back: false, card: face("d1", "diamonds", 1) },
  { left: "44%", delay: "3.3s", duration: "10.5s", tilt: "9deg", back: false, card: face("s12", "spades", 12) },
  { left: "52%", delay: "8.2s", duration: "13.5s", tilt: "-14deg", back: true, card: face("b3", "hearts", 7) },
  { left: "61%", delay: "0.6s", duration: "12.8s", tilt: "18deg", back: false, card: face("h13", "hearts", 13) },
  { left: "69%", delay: "4.7s", duration: "11.6s", tilt: "-20deg", back: false, card: face("c5", "clubs", 5) },
  { left: "76%", delay: "6.1s", duration: "14.2s", tilt: "7deg", back: true, card: face("b4", "clubs", 3) },
  { left: "84%", delay: "2.8s", duration: "12.2s", tilt: "-11deg", back: false, card: face("d11", "diamonds", 11) },
  { left: "91%", delay: "9s", duration: "13.8s", tilt: "15deg", back: false, card: face("s1", "spades", 1) },
  { left: "7%", delay: "10.4s", duration: "12s", tilt: "25deg", back: false, card: face("h8", "hearts", 8) },
  { left: "58%", delay: "11.6s", duration: "11s", tilt: "-6deg", back: true, card: face("b5", "spades", 9) },
  { left: "39%", delay: "13s", duration: "14s", tilt: "13deg", back: false, card: face("c1", "clubs", 1) },
];

function face(id: string, suit: Suit, rank: Card["rank"]): Card {
  return { id, suit, rank, faceUp: true };
}

export function FallingCards({ layer = "page" }: { layer?: "page" | "win" }) {
  return (
    <div
      className={cn("land-confetti", layer === "win" && "is-win")}
      aria-hidden="true"
    >
      {FALL.map((item) => (
        <div
          key={item.card.id}
          className="land-fall-card"
          style={{
            left: item.left,
            animationDelay: item.delay,
            animationDuration: item.duration,
            ["--tilt" as string]: item.tilt,
          }}
        >
          {item.back ? (
            <CardBack />
          ) : (
            <CardView card={item.card} compact />
          )}
        </div>
      ))}
    </div>
  );
}
