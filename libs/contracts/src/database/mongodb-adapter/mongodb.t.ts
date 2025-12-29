import { Db, MongoClient } from "mongodb";
import { IDatabaseSchema } from "../database/schema.js";
import { IRelationshipResolver } from "../eloquent/relationships.t.js";

import { IMongoConfig } from "./IMongoConfig.js";

export interface IMongoDbAdapter {
  _adapter_type_: string;

  getConfig(): IMongoConfig;

  normalizeColumn(col: string): string;

  getDockerComposeFileName(): string;

  getDefaultCredentials(): string | null;

  getRelationshipResolver(): IRelationshipResolver;

  getClient(): MongoClient;

  getDb(): Db;

  connectDefault(): Promise<void>;

  getMongoClientWithDatabase(
    database?: string,
    options?: object,
  ): Promise<MongoClient>;

  getSchema(): IDatabaseSchema;

  isConnected(): Promise<boolean>;

  createMigrationSchema(tableName: string): Promise<unknown>;

  close(): Promise<void>;
}
