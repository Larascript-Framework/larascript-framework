import { TBaseRequest } from "./BaseRequest.js";

export interface IRequestContextData extends Map<string, Map<string, unknown>> {}

export type IPDatesArrayTTL<T = unknown> = { value: T; ttlSeconds: number | null; createdAt: Date };

export type IPContextData<T = unknown> = Map<string, Map<string, IPDatesArrayTTL<T>>>;

export interface IRequestContext {
  setByRequest<T = unknown>(req: TBaseRequest, key: string, value: T): this;
  getByRequest<T = unknown>(req: TBaseRequest, key?: string): T | undefined;
  setByIpAddress<T = unknown>(req: TBaseRequest, key: string, value: T, ttlSeconds?: number): this;
  getByIpAddress<T = unknown>(req: TBaseRequest, key?: string): T | undefined;
  endRequestContext(req: TBaseRequest): void;
  getRequestContext(): IRequestContextData;
  setRequestContext(context: IRequestContextData): this;
  getIpContext(): IPContextData;
  setIpContext(context: IPContextData): this;
}