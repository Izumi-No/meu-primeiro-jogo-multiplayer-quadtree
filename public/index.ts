import { IAnyCommand } from "../shared/interfaces/Command.ts";
import { QuadTree, Rectangle } from "../shared/quadtree.ts";
import { Game } from "./game.ts";
import { KeyboardListener } from "./keyboardListener.ts";
import renderScreen from "./render.ts";

const game = new Game();
const keyboardListener = new KeyboardListener(document);
let currentPlayerId: string = "";

// WebSocket setup
const ws = new WebSocket(
  `${location.protocol === "https:" ? "wss" : "ws"}://${location.host}/wss`
);

console.log(location);

ws.addEventListener("open", () => {
  console.log("connected to the server");
});

ws.addEventListener("message", (message: MessageEvent) => {
  const data: IAnyCommand<{
    type: "player" | "fruit";
  }> = JSON.parse(message.data);
  if (data.type === "setup") {
    console.log(`Receiving ${data.type} -> ${JSON.stringify(data)}`);

    // Create the QuadTree with the received state
    const quadtree = new QuadTree<{ type: "player" | "fruit" }>(
      new Rectangle(0, 0, data.state.screen.width, data.state.screen.height),
      data.state.maxObjects
    );

    // Insert points (players and fruits) into the QuadTree
    for (const [id, point] of data.state.points) {
      quadtree.insert(id, point);
    }

    // Set the game state with the QuadTree and screen dimensions
    game.setState({
      screen: data.state.screen,
      quadtree,
    });

    // Register the current player ID with the keyboardListener
    keyboardListener.registerUserId(currentPlayerId);

    // Subscribe to keyboard events to send commands to the server
    keyboardListener.subscribe((command) => {
      ws.send(JSON.stringify(command));
    });

    // Subscribe to keyboard events to update player movement in the game
    keyboardListener.subscribe((command) => {
      game.movePlayer(command);
    });
  }

  if (data.type === "uid") {
    console.log(`Receiving ${data.type} -> ${data.uid}`);
    currentPlayerId = data.uid;

    keyboardListener.registerUserId(data.uid);

    game.addPlayer({ type: "add-player", playerId: data.uid });

    const screen = document.getElementById("screen") as HTMLCanvasElement;

    renderScreen(screen, game, requestAnimationFrame, currentPlayerId);
  }

  if (data.type === "move-player") {
    console.log(`Receiving ${data.type} -> ${data.playerId}`);

    if (currentPlayerId !== data.playerId) {
      game.movePlayer(data);
    }
  }

  if (data.type === "add-player") {
    console.log(`Receiving ${data.type} -> ${data.playerId}`);

    game.addPlayer(data);
  }

  if (data.type === "remove-player") {
    console.log(`Receiving ${data.type} -> ${data.playerId}`);

    game.removePlayer(data);
    game.state.quadtree.update();
  }

  if (data.type === "add-fruit") {
    console.log(`Receiving ${data.type} -> ${data.fruitId}`);

    game.addFruit(data);
  }

  if (data.type === "remove-fruit") {
    console.log(`Receiving ${data.type} -> ${data.fruitId}`);

    game.removeFruit(data);
    game.state.quadtree.update();
  }
});
