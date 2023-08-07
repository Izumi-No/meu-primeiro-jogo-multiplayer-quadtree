import {
  IAddFruitCommand,
  IAddPlayerCommand,
  ICommand,
  IMovePlayerCommand,
  IRemoveFruitCommand,
  IRemovePlayerCommand,
} from "../shared/interfaces/Command.ts";
import { Observable, IObserver } from "../shared/interfaces/IObserver.ts";
import { IPoint } from "../shared/interfaces/IPoint.ts";
import { QuadTree, Rectangle } from "../shared/quadtree.ts";

export type GameState = {
  quadtree: QuadTree<{ type: "player" | "fruit" }>;
  screen: { width: number; height: number };
};

let gamesize: number;
/*#if _BROWSER
let SIZE_OF_GAME = process.env.SIZE_OF_GAME;

gamesize = Number(SIZE_OF_GAME || 100);
console.log(`Game size: ${gamesize}`);

//#else */
gamesize = Number(Deno.env.get("SIZE_OF_GAME") || 1000);

console.log(`Game size: ${gamesize}`);

//#endif

export class Game extends Observable {
  private observers: IObserver[] = [];
  public state: GameState = {
    quadtree: new QuadTree(new Rectangle(0, 0, gamesize, gamesize), 4),

    screen: {
      width: gamesize,
      height: gamesize,
    },
  };

  constructor(private frequency = 10000) {
    super();
  }

  setState(newState: GameState) {
    Object.assign(this.state, newState);
  }

  addFruit(command: IAddFruitCommand) {
    const fruitId = command.fruitId || Math.floor(Math.random() * 10000000);

    const position = command.position || {
      x: Math.floor(Math.random() * this.state.screen.width),
      y: Math.floor(Math.random() * this.state.screen.height),
    };

    this.state.quadtree.insert(fruitId.toString(), {
      type: "fruit",
      x: position.x,
      y: position.y,
    });

    this.notifyAll({
      type: "add-fruit",
      fruitId: fruitId,
      position: position,
    });
  }

  addPlayer(command: IAddPlayerCommand): void {
    const playerId = command.playerId;
    const position = command.position || {
      x: Math.floor(Math.random() * this.state.screen.width),
      y: Math.floor(Math.random() * this.state.screen.height),
    };

    this.state.quadtree.insert(playerId, {
      type: "player",
      x: position.x,
      y: position.y,
    });

    this.notifyAll({
      type: "add-player",
      playerId,
      position: position,
    });
  }

  removePlayer(command: IRemovePlayerCommand): void {
    const player = this.state.quadtree.search(command.playerId);

    if (!(player && player.type === "player")) {
      return;
    }
    this.state.quadtree.remove(command.playerId);

    this.notifyAll({
      type: "remove-player",
      playerId: command.playerId,
    });
  }
  removeFruit(command: IRemoveFruitCommand) {
    const fruit = this.state.quadtree.search(command.fruitId);

    if (!(fruit && fruit.type === "fruit")) {
      return;
    }

    this.state.quadtree.remove(command.fruitId);

    this.notifyAll({
      type: "remove-fruit",
      fruitId: command.fruitId,
    });
  }
  playerEatFruit(playerId: string) {
    const player = this.state.quadtree.search(playerId);

    if (!(player && player.type === "player")) {
      return;
    }

    const fruits: [
      string,
      IPoint & {
        type: "fruit" | "player";
      }
    ][] = [];

    this.state.quadtree.queryRadius(player, 0.5).forEach((val, key) => {
      if (val.type === "fruit") {
        fruits.push([key, val]);
      }
    });

    fruits.forEach(([fruitId, fruit]) => {
      const dx = fruit.x - player.x;
      const dy = fruit.y - player.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance <= 0.5) {
        this.removeFruit({ type: "remove-fruit", fruitId });
      }
    });
  }

  movePlayer(command: IMovePlayerCommand) {
    const playerId = command.playerId;
    const keyPressed = command.keyPressed;

    const acceptedMoves: {
      [x: string]: (player: IPoint, state: GameState) => void;
    } = {
      ArrowUp(player: IPoint, _state: GameState) {
        if (player.y - 1 >= 0) {
          player.y = player.y - 1;
        }
      },
      ArrowRight(player: IPoint, state: GameState) {
        if (player.x + 1 < state.screen.width) {
          player.x = player.x + 1;
        }
      },
      ArrowDown(player: IPoint, state: GameState) {
        if (player.y + 1 < state.screen.height) {
          player.y = player.y + 1;
        }
      },
      ArrowLeft(player: IPoint, _state: GameState) {
        if (player.x - 1 >= 0) {
          player.x = player.x - 1;
        }
      },
    };

    const player = this.state.quadtree.search(playerId);

    const moveFunction = acceptedMoves[keyPressed];

    console.log(`Moving ${playerId} with ${keyPressed}`);
    if (player && moveFunction) {
      moveFunction(player, this.state);
      this.playerEatFruit(playerId);
      this.notifyAll({
        type: "move-player",
        playerId: playerId,
        position: player,
      });
    }
  }

  subscribe<T extends ICommand>(observer: IObserver<T>): void {
    this.observers.push(observer);
  }

  protected notifyAll<T extends ICommand>(data: T): void {
    this.observers.forEach((observer) => observer(data));
  }

  start() {
    setInterval(
      () =>
        this.addFruit({
          type: "add-fruit",
        }),
      this.frequency
    );
  }
}
