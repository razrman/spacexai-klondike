import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  HelpCircle,
  Lightbulb,
  Play,
  ScrollText,
  Undo2,
  Volume2,
} from "lucide-react";
import { CardBack, CardView } from "./CardView";
import { Button } from "@/components/ui/button";
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

const BALLOONS = [
  {
    title: "New",
    body: "Deal a fresh table. Keyboard N.",
    anchor: "new",
  },
  {
    title: "Undo",
    body: "Take back the last play. Keyboard U.",
    anchor: "undo",
  },
  {
    title: "Hint",
    body: "Light the next useful play. Keyboard H.",
    anchor: "hint",
  },
  {
    title: "Auto",
    body: "Watch the table play itself, half a second per move. Keyboard A.",
    anchor: "auto",
  },
  {
    title: "Draw 1 / 3",
    body: "Flip one card from the stock, or three at a time.",
    anchor: "draw",
  },
  {
    title: "Stock",
    body: "Tap the deck or press Space to turn cards. Two passes in draw-three, then the deal is done if nothing else plays.",
    anchor: "stock",
  },
  {
    title: "Tableau",
    body: "Drag a card or a face-up run. Build down in alternating colors. Aces never sit on a two — they go up.",
    anchor: "tableau",
  },
  {
    title: "Foundations",
    body: "Hearts, clubs, diamonds, spades from left to right. Build each suit Ace through King.",
    anchor: "foundations",
  },
  {
    title: "Log",
    body: "Open the move log to see every auto and manual play, with the hints that were on the table. Keyboard L.",
    anchor: "log",
  },
];

export function Landing() {
  return (
    <div className="landing">
      <FallingCards />
      <Hero />
      <About />
      <ControlsTour />
      <TryIt />
    </div>
  );
}

function FallingCards() {
  return (
    <div className="land-confetti" aria-hidden="true">
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

function Hero() {
  const fade = useScrollFade(true);
  return (
    <section className="land-hero">
      <img
        className="land-starship"
        src="/starship-reentry.jpg?v=3"
        alt="SpaceX Starship reentering, plasma on the flaps"
        width={1792}
        height={1008}
      />
      <div
        ref={fade.ref}
        className={cn("land-hero-copy", fade.on && "is-in")}
      >
        <p className="land-kicker">xAI · SpaceX</p>
        <h1>Klondike</h1>
        <p className="land-lede">
          Classic solitaire on a felt table, Starship coming in through the
          plasma, and the xAI mark on every facedown card.
        </p>
        <p className="land-scroll-hint">Scroll</p>
      </div>
    </section>
  );
}

function About() {
  const fade = useScrollFade();
  return (
    <section className="land-section">
      <div ref={fade.ref} className={cn("land-copy", fade.on && "is-in")}>
        <p className="land-kicker">The game</p>
        <h2>Seven columns. Four suits. One quiet table.</h2>
        <p>
          Klondike is the solitaire most people mean when they say solitaire.
          A shuffled deck is laid into seven tableau piles — one card, then
          two, then three, up to seven — with only the top of each pile
          turned up. The rest of the deck waits in the stock.
        </p>
        <p>
          Build the tableau down in rank, red on black and black on red.
          Move a whole face-up run when it fits. Turn hidden cards by
          clearing what sits on them. Aces start the four foundations —
          hearts, clubs, diamonds, spades, left to right — and each suit
          climbs Ace through King.
        </p>
        <p>
          Draw from the stock one card at a time, or three. Empty a column
          and a King may take the space. The deal is won when every
          foundation is complete.
        </p>
      </div>
    </section>
  );
}

function ControlsTour() {
  const wrap = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = wrap.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const span = Math.max(el.offsetHeight - window.innerHeight, 1);
      const p = Math.min(1, Math.max(0, -rect.top / span));
      setActive(Math.min(BALLOONS.length - 1, Math.floor(p * BALLOONS.length)));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const balloon = BALLOONS[active]!;

  return (
    <section ref={wrap} className="land-tour">
      <div className="land-tour-sticky">
        <p className="land-kicker">The controls</p>
        <h2>Every switch on the rail.</h2>
        <div className="land-hud-stage">
          <div className="land-hud-fake" aria-hidden="true">
            <span className="land-hud-title">Klondike</span>
            <span className="land-hud-stat">Time</span>
            <span className="land-hud-stat">Moves</span>
            <span className="land-hud-stat">Score</span>
            <span className={cn("land-chip", balloon.anchor === "new" && "is-hot")}>
              New
            </span>
            <span className={cn("land-icon", balloon.anchor === "undo" && "is-hot")}>
              <Undo2 className="size-4" />
            </span>
            <span className={cn("land-icon", balloon.anchor === "hint" && "is-hot")}>
              <Lightbulb className="size-4" />
            </span>
            <span className={cn("land-chip", balloon.anchor === "auto" && "is-hot")}>
              <Play className="size-4" />
              Auto
            </span>
            <span className={cn("land-chip", balloon.anchor === "draw" && "is-hot")}>
              1 · 3
            </span>
            <span className={cn("land-icon", balloon.anchor === "log" && "is-hot")}>
              <ScrollText className="size-4" />
            </span>
            <span className="land-icon">
              <Volume2 className="size-4" />
            </span>
            <span className="land-icon">
              <HelpCircle className="size-4" />
            </span>
          </div>
          <div className="land-mini-table" aria-hidden="true">
            <span className={cn("land-mini-pile", balloon.anchor === "stock" && "is-hot")}>
              Stock
            </span>
            <span className={cn("land-mini-pile", balloon.anchor === "tableau" && "is-hot")}>
              Tableau
            </span>
            <span className={cn("land-mini-pile", balloon.anchor === "foundations" && "is-hot")}>
              ♥
            </span>
            <span className={cn("land-mini-pile", balloon.anchor === "foundations" && "is-hot")}>
              ♣
            </span>
            <span className={cn("land-mini-pile", balloon.anchor === "foundations" && "is-hot")}>
              ♦
            </span>
            <span className={cn("land-mini-pile", balloon.anchor === "foundations" && "is-hot")}>
              ♠
            </span>
          </div>
          <div
            key={balloon.anchor}
            className={cn("land-balloon", `is-${balloon.anchor}`)}
          >
            <p className="land-balloon-title">{balloon.title}</p>
            <p>{balloon.body}</p>
          </div>
        </div>
        <p className="land-tour-note">
          Keep scrolling — each control steps in, then gives way to the next.
        </p>
      </div>
    </section>
  );
}

function TryIt() {
  const fade = useScrollFade();
  return (
    <section className="land-cta">
      <div ref={fade.ref} className={cn("land-cta-inner", fade.on && "is-in")}>
        <p className="land-kicker">The table</p>
        <h2>Sit down and deal.</h2>
        <p>
          Drag with a pointer, tap to auto-place, or let Auto play the
          advancing line. The log keeps every move.
        </p>
        <Button asChild className="land-try">
          <Link to="/play">Try it</Link>
        </Button>
      </div>
    </section>
  );
}

function useScrollFade(startOn = false) {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(startOn);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        setOn(entry.isIntersecting && entry.intersectionRatio > 0.18);
      },
      { threshold: [0, 0.18, 0.4, 0.7, 1] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return { ref, on };
}
