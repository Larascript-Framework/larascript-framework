import { TClassConstructor } from "../../core/constructor.js";
import { IMongoDbAdapter } from "../mongodb-adapter/mongodb.t.js";
import { IPostgresAdapter } from "../postgres-adapter/postgres.t.js";
import { IDatabaseAdapter } from "./adapter.js";
import { IDatabaseSchema } from "./schema.js";

export interface IConnectionTypes extends Record<string, IDatabaseAdapter> {}

export interface IDatabaseService {

  boot(): Promise<void>;

  register(): void;

  showLogs(): boolean;

  getDefaultConnectionName(): string;

  getAdapter<Adapter extends IDatabaseAdapter = IDatabaseAdapter>(
    connectionName?: string,
  ): Adapter;

  getAllAdapterConstructors(): TClassConstructor<IDatabaseAdapter>[];

  isRegisteredAdapter(adapter: TClassConstructor<IDatabaseAdapter>, connectionName?: string): boolean

  getDefaultCredentials(adapterName: string): string | null;

  schema<TSchema extends IDatabaseSchema = IDatabaseSchema>(
    connectionName?: string,
  ): TSchema;

  createMigrationSchema(tableName: string, connectionName?: string): Promise<unknown>;

  postgres(connectionName?: string): IPostgresAdapter;

  mongodb(connectionName?: string): IMongoDbAdapter;

  getAvailableAdaptersNames(): string[];
}
