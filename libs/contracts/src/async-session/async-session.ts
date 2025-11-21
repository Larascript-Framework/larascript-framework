export type TAsyncSessionData = Record<string, unknown>;
export type TAsyncSessionObject<
  T extends TAsyncSessionData = TAsyncSessionData,
> = {
  id: string;
  data: T;
};

export interface IAsyncSessionService {
  start(sessionId?: string): Promise<void>;
  runWithSession<T extends TAsyncSessionData, R>(
    callback: () => Promise<R> | R,
    data?: T,
  ): Promise<R>;
  createSession<T extends TAsyncSessionData>(data?: T): TAsyncSessionObject<T>;
  getSession<T extends TAsyncSessionData>(): TAsyncSessionObject<T>;
  getSessionId(): string;
  getSessionData<T extends TAsyncSessionData>(): T;
  setSessionData<T extends TAsyncSessionData>(data: T): void;
  updateSessionData<T extends TAsyncSessionData>(data: T): void;
}
