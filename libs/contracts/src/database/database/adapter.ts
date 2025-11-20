import { TClassConstructor } from "@/core/constructor.js";
import { IEloquent } from "../eloquent/eloquent.t.js";
import { IRelationshipResolver } from "../eloquent/relationships.t.js";
import { IModel } from "../model/model.t.js";
import { IPrepareOptions } from "./options.js";
import { IDatabaseSchema } from "./schema.js";

export interface IAdapterComposerFileName {
  fullName: string;
  shortName: string;
}

export interface IDatabaseAdapterConstructor<
  T extends IDatabaseAdapter = IDatabaseAdapter,
> extends TClassConstructor<T> {
  new (...args: any[]): T;
}

export interface IDatabaseAdapters {
  [key: string]: IDatabaseAdapter;
}

export interface IDatabaseAdapter<Config = unknown> {
  _adapter_type_: string;

  getConfig(): Config;

  normalizeColumn(col: string): string;

  setConnectionName(...args: any[]): void;

  getConnectionName(...args: any[]): string;

  connectDefault(): Promise<unknown>;

  isConnected(): Promise<boolean>;

  getSchema(): IDatabaseSchema;

  getEloquentConstructor<Model extends IModel = IModel>(): TClassConstructor<
    IEloquent<Model>
  >;

  getRelationshipResolver(connection?: string): IRelationshipResolver;

  getDockerComposeFileName(): string;

  getDefaultCredentials(): string | null;

  createMigrationSchema(...args: any[]): Promise<unknown>;

  prepareDocument<T extends object = object>(
    document: T,
    prepareOptions?: IPrepareOptions,
  ): T;

  close(): Promise<void>;
}
