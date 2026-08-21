import { createFileRoute } from "@tanstack/react-router";
import { Game } from "../components/solitaire/Game";

export const Route = createFileRoute("/play")({
  component: Play,
});

function Play() {
  return <Game />;
}
