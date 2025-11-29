import { TClassConstructor } from "../../core/constructor.js";
import { IHasObserver } from "../../observer/observer.js";
import { IdGeneratorFn } from "../eloquent/eloquent.t.js";
import { IModelFactory } from "./factory.t.js";

export type TModelScope = "read" | "write" | "create" | "delete" | "all";

export type GetAttributesOptions = { excludeGuarded: boolean };

export type ModelConstructor<M extends IModel = IModel> = {
  new (...args: any[]): M;
  create<T extends M>(data?: T["attributes"] | null): T;
  createWithoutProxy<T extends M>(data?: T["attributes"] | null): T;
  getTable(): string;
  getPrimaryKey(): string;
  getConnectionName(): string;
  getScopes(scopes: TModelScope[], additionalScopes?: string[]): string[];
  getFields(): string[];
  factory(): IModelFactory<IModel>;
  getRelationships(): string[];
  isAttributeEncrypted(attribute: string): boolean;
};

export type ModelInstance<MCtor extends ModelConstructor<any>> =
  InstanceType<MCtor>;

export type ModelAttribtues<Model extends IModel> = Model["attributes"];

export type ModelWithAttributes<
  Model extends IModel,
  Attributes = Model["attributes"],
> = Model & {
  [K in keyof Attributes]: Attributes[K];
};

export interface IModelAttributes {
  id?: string;
  createdAt?: Date;
  updatedAt?: Date;
  [key: string]: unknown;
}

export interface IModel<Attributes extends IModelAttributes = IModelAttributes>
  extends IHasObserver {
  [key: string]: unknown;
  connection: string;
  primaryKey: string;
  fields: string[];
  guarded: string[];
  dates: string[];
  timestamps: boolean;
  json: string[];
  attributes: Attributes | null;
  original: Attributes | null;
  relationships: string[];
  getFactory(): IModelFactory<IModel>;
  setConnectionName(connectionName: string): void;
  getConnectionName(): string;
  getIdGeneratorFn(): IdGeneratorFn | undefined;
  attr<K extends keyof Attributes = keyof Attributes>(
    key: K,
    value?: unknown,
  ): Promise<Attributes[K] | null | undefined>;
  attrSync<K extends keyof Attributes = keyof Attributes>(
    key: K,
    value?: unknown,
  ): Attributes[K] | null | undefined;
  setAttribute(key: keyof Attributes, value?: unknown): Promise<void>;
  getAttributeSync<K extends keyof Attributes = keyof Attributes>(
    key: K,
  ): Attributes[K] | null;
  getAttribute(
    key: keyof Attributes,
  ): Promise<Attributes[keyof Attributes] | null>;
  getAttributes(options?: { excludeGuarded?: boolean }): Attributes | null;
  encryptAttributes(attributes: Attributes | null): Attributes | null;
  getOriginal(key: keyof Attributes): Attributes[keyof Attributes] | null;
  getDirty(): Record<keyof Attributes, any> | null;
  getJsonProperties(): string[];
  isDirty(): boolean;
  getFields(): string[];
  useTableName(): string;
  getId(): string | undefined;
  setTimestamp(dateTimeField: string, value: Date): Promise<void>;
  fill(data: Partial<Attributes>): Promise<void>;
  toObject(options?: GetAttributesOptions): Promise<Attributes | null>;
  refresh(): Promise<Attributes | null>;
  update(): Promise<void>;
  save(): Promise<void>;
  delete(): Promise<void>;
  getRelationships(): string[];
  loadRelationships(options: {
    only?: string[];
    loadAsAttributes?: boolean;
    excludeGuarded?: boolean;
  }): Promise<IModel<IModelAttributes>>;

  // Events
  on(event: IModelLifeCycleEvent, eventConstructor: TClassConstructor): void;
  off(event: IModelLifeCycleEvent): void;
}

export type IModelLifeCycleEvent =
  | "updating"
  | "updated"
  | "deleting"
  | "deleted"
  | "creating"
  | "created";

export type IModelEvents = {
  [key in IModelLifeCycleEvent]?: TClassConstructor;
};
