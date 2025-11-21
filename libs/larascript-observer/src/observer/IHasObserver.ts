/* eslint-disable @typescript-eslint/no-explicit-any */
import { IObserver } from "./IObserver.js";

export type TClassConstructor<T = any> = new (...args: any[]) => T;

export type ObserveConstructor = TClassConstructor<IObserver>;

export interface IHasObserver {
  setObserverConstructor(
    observerConstructor: ObserveConstructor | undefined,
  ): void;
  getObserver(): IObserver | undefined;
  setObserveProperty(attribute: string, method: string): void;
}
