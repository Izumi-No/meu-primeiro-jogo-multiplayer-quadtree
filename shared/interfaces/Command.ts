import { IPoint } from "./IPoint.ts";

export type ICommand = {
  type: string;
};

export type GameState<T = {}> = {
  points: Map<string, IPoint & T>;
  maxObjects: number;
  screen: { width: number; height: number };
};

export interface ISetupCommand<T = {}> extends ICommand {
  type: "setup";
  state: GameState<T>;
}

export interface IMovePlayerCommand extends ICommand {
  type: "move-player";
  playerId: string;
  keyPressed: string;
}

export interface IRemovePlayerCommand extends ICommand {
  type: "remove-player";
  playerId: string;
}

export interface IAddFruitCommand extends ICommand {
  type: "add-fruit";
  fruitId?: string;
  position?: IPoint;
}

export interface IRemoveFruitCommand extends ICommand {
  type: "remove-fruit";
  fruitId: string;
}

export interface IAddPlayerCommand extends ICommand {
  type: "add-player";
  playerId: string;
  position?: IPoint;
}

export interface IUidCommand extends ICommand {
  type: "uid";
  uid: string;
}

export interface IPlayerEatFruitCommand extends ICommand {
  type: "player-eat-fruit";
  playerId: string;
  fruitId: string;
}

export type IAnyCommand<T = {}> =
  | IMovePlayerCommand
  | IRemovePlayerCommand
  | IAddFruitCommand
  | IRemoveFruitCommand
  | IAddPlayerCommand
  | IUidCommand
  | ISetupCommand<T>;
