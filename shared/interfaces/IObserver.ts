export type IObserver<T = any> = (data: T) => void;

export abstract class Observable<T = any> {
  abstract subscribe(observer: IObserver<T>): void;
  protected abstract notifyAll(data: T): void;
}
