import { ICommand, IMovePlayerCommand } from "../shared/interfaces/Command.ts";
import { IObserver, Observable } from "../shared/interfaces/IObserver.ts";

export class KeyboardListener extends Observable {
  private observers: IObserver[] = [];

  constructor(document: Document, private UserId: string = "") {
    super();

    document.addEventListener("keydown", (event) => {
      const keyPressed = event.key;

      this.notifyAll({
        keyPressed,
        playerId: this.UserId,
        type: "move-player",
      });
    });
  }

  registerUserId(UserId: string) {
    this.UserId = UserId;
  }

  subscribe<T extends ICommand = IMovePlayerCommand>(observer: IObserver<T>) {
    this.observers.push(observer);
  }

  protected notifyAll(command: IMovePlayerCommand) {
    for (const observerFunction of this.observers) {
      observerFunction(command);
    }
  }
}
