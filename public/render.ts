import { Game } from "./game.ts";
import { QuadTree } from "../shared/quadtree.ts";

export default function renderScreen(
  screen: HTMLCanvasElement,
  game: Game,
  requestAnimationFrame: (callback: () => void) => void,
  currentPlayerId: string
) {
  screen.width = game.state.screen.width;
  screen.height = game.state.screen.height;

  const context = screen.getContext("2d");
  if (context) {
    context.fillStyle = "white";
    context.clearRect(0, 0, screen.width, screen.height);

    //rendering the quadtree

    const renderQuadtree = (quadtree: QuadTree, depth = 0) => {
      if (depth > 4) return;
      const { x, y, width, height } = quadtree.boundary;
      context.strokeStyle = "red";
      context.strokeRect(x, y, width, height);
      quadtree.nodes.forEach((node) => renderQuadtree(node, depth + 1));
    };

    renderQuadtree(game.state.quadtree);

    const points = game.state.quadtree.getAllPoints();

    points.forEach(([id, point]) => {
      if (point.type === "player") {
        if (id === currentPlayerId) {
          context.fillStyle = "#F0DB4F";
        } else {
          context.fillStyle = "rgba(0, 0, 0, 0.5)";
        }
      } else {
        context.fillStyle = "green";
      }
      context.fillRect(point.x, point.y, 1, 1);
    });

    requestAnimationFrame(() => {
      renderScreen(screen, game, requestAnimationFrame, currentPlayerId);
    });
  }
}
