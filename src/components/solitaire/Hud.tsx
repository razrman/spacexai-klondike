import {
  HelpCircle,
  Lightbulb,
  Pause,
  Play,
  ScrollText,
  Undo2,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatTime } from "@/lib/solitaire/types";
import { cn } from "@/lib/utils";

export function Hud({
  time,
  moves,
  score,
  canUndo,
  canComplete,
  autoplay,
  search,
  sound,
  drawCount,
  onNew,
  onUndo,
  onHint,
  onComplete,
  onToggleAutoplay,
  onSearch,
  onToggleSound,
  onDrawCount,
  onHelp,
  onLog,
}: {
  time: number;
  moves: number;
  score: number;
  canUndo: boolean;
  canComplete: boolean;
  autoplay: boolean;
  search: boolean;
  sound: boolean;
  drawCount: 1 | 3;
  onNew: () => void;
  onUndo: () => void;
  onHint: () => void;
  onComplete: () => void;
  onToggleAutoplay: () => void;
  onSearch: (on: boolean) => void;
  onToggleSound: () => void;
  onDrawCount: (n: 1 | 3) => void;
  onHelp: () => void;
  onLog: () => void;
}) {
  return (
    <header className="hud">
      <div className="flex items-baseline gap-3 min-w-0">
        <h1 className="font-display text-xl font-semibold tracking-tight text-cream sm:text-2xl">
          Klondike
        </h1>
        <p className="hidden text-xs tracking-wide text-muted uppercase sm:block">
          Solitaire
        </p>
      </div>

      <dl className="hud-stats">
        <div>
          <dt>Time</dt>
          <dd className="tabular-nums">{formatTime(time)}</dd>
        </div>
        <div>
          <dt>Moves</dt>
          <dd className="tabular-nums">{moves}</dd>
        </div>
        <div>
          <dt>Score</dt>
          <dd className="tabular-nums">{score}</dd>
        </div>
      </dl>

      <div className="hud-actions">
        <Button variant="subtle" size="sm" onClick={onNew}>
          New
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Undo"
          disabled={!canUndo}
          onClick={onUndo}
        >
          <Undo2 className="size-4" />
        </Button>
        <Button variant="ghost" size="icon-sm" aria-label="Hint" onClick={onHint}>
          <Lightbulb className="size-4" />
        </Button>
        <Button
          variant={autoplay ? "subtle" : "ghost"}
          size="sm"
          aria-label={autoplay ? "Stop autoplay" : "Autoplay"}
          aria-pressed={autoplay}
          onClick={onToggleAutoplay}
        >
          {autoplay ? (
            <Pause className="size-4" />
          ) : (
            <Play className="size-4" />
          )}
          Auto
        </Button>
        <div className="dfs-switch">
          <span>DFS</span>
          <div className="draw-toggle" role="group" aria-label="DFS search">
            <button
              type="button"
              className={cn(!search && "is-active")}
              aria-pressed={!search}
              onClick={() => onSearch(false)}
            >
              Off
            </button>
            <button
              type="button"
              className={cn(search && "is-active")}
              aria-pressed={search}
              title="Depth-first search of every untried branch"
              onClick={() => onSearch(true)}
            >
              On
            </button>
          </div>
        </div>
        {canComplete ? (
          <Button variant="subtle" size="sm" onClick={onComplete}>
            Finish
          </Button>
        ) : null}
        <div className="draw-toggle" role="group" aria-label="Cards drawn">
          <button
            type="button"
            className={cn(drawCount === 1 && "is-active")}
            onClick={() => onDrawCount(1)}
          >
            1
          </button>
          <button
            type="button"
            className={cn(drawCount === 3 && "is-active")}
            onClick={() => onDrawCount(3)}
          >
            3
          </button>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={sound ? "Mute sound" : "Unmute sound"}
          onClick={onToggleSound}
        >
          {sound ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
        </Button>
        <Button variant="ghost" size="icon-sm" aria-label="Move log" onClick={onLog}>
          <ScrollText className="size-4" />
        </Button>
        <Button variant="ghost" size="icon-sm" aria-label="How to play" onClick={onHelp}>
          <HelpCircle className="size-4" />
        </Button>
      </div>
    </header>
  );
}