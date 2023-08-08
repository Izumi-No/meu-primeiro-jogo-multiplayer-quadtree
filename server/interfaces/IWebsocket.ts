export interface IWebsocket<T = string | symbol | number, E extends T = T> {
  send(data: string): void;
  onOpen(callback: () => void): void;
  onClose(callback: () => void): void;
  onMessage(callback: (data: string) => void): void;
  onError?(callback: (error: Error) => void): void;
  addEventListener?(event: E, callback: () => void): void;
}
