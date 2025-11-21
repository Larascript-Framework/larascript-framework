import { TClassConstructor } from "@larascript-framework/larascript-utils";
import BaseDatabaseAdapter from "../../../database/base/BaseDatabaseAdapter.js";
import { IDatabaseSchema, IPrepareOptions } from "../../../database/index.js";
import { IEloquent, IRelationshipResolver } from "../../../eloquent/index.js";
import { IModel } from "../../../model/index.js";

// Mock schema implementation
const MockSchema: IDatabaseSchema = {
  createDatabase: async (name: string) => {},
  databaseExists: async (name: string) => true,
  dropDatabase: async (name: string) => {},
  createTable: async (name: string, ...args: any[]) => {},
  dropTable: async (name: string, ...args: any[]) => {},
  tableExists: async (name: string) => true,
  alterTable: async (name: string, ...args: any[]) => {},
  dropAllTables: async () => {},
};

export const MockRelationshipResolver: IRelationshipResolver = {
  resolveData: async () => [] as any,
  attachEloquentRelationship: () => ({}) as IEloquent,
};

export const MockSQLConfig: ReturnType<MockSQLAdapter["getConfig"]> = {
  connectionString: "sql://user:pass@localhost:3306/db",
};

export class MockSQLAdapter extends BaseDatabaseAdapter<{
  connectionString: string;
}> {
  _adapter_type_ = "sql";

  // Column normalization
  normalizeColumn(col: string): string {
    return col.toLowerCase();
  }

  // Connection management
  setConnectionName(...args: any[]): void {}

  getConnectionName(...args: any[]): string {
    return "sql";
  }

  async connectDefault(): Promise<unknown> {
    return true;
  }

  async isConnected(): Promise<boolean> {
    return true;
  }

  async close(): Promise<void> {}

  // Schema operations
  getSchema(): IDatabaseSchema {
    return MockSchema;
  }

  async createMigrationSchema(...args: any[]): Promise<unknown> {
    return undefined;
  }

  // Eloquent and relationships
  getEloquentConstructor<Model extends IModel = IModel>(): TClassConstructor<
    IEloquent<Model>
  > {
    return class MockEloquent {} as any;
  }

  getRelationshipResolver(): IRelationshipResolver {
    return MockRelationshipResolver;
  }

  // Configuration
  getDockerComposeFileName(): string {
    return "docker-compose.sql.yml";
  }

  getDefaultCredentials(): string | null {
    return "sql://user:pass@localhost:3306/db";
  }

  // Document preparation
  prepareDocument<T extends object = object>(
    document: T,
    prepareOptions?: IPrepareOptions,
  ): T {
    return document;
  }
}

export class MockMongoDBAdapter extends BaseDatabaseAdapter<{ uri: string }> {
  _adapter_type_ = "mongodb";

  // Column normalization
  normalizeColumn(col: string): string {
    return col.toLowerCase();
  }

  // Connection management
  setConnectionName(...args: any[]): void {}

  getConnectionName(...args: any[]): string {
    return "sql";
  }

  async connectDefault(): Promise<unknown> {
    return true;
  }

  async isConnected(): Promise<boolean> {
    return true;
  }

  async close(): Promise<void> {}

  // Schema operations
  getSchema(): IDatabaseSchema {
    return MockSchema;
  }

  async createMigrationSchema(...args: any[]): Promise<unknown> {
    return undefined;
  }

  // Eloquent and relationships
  getEloquentConstructor<Model extends IModel = IModel>(): TClassConstructor<
    IEloquent<Model>
  > {
    return class MockEloquent {} as any;
  }

  getRelationshipResolver(): IRelationshipResolver {
    return MockRelationshipResolver;
  }

  // Configuration
  getDockerComposeFileName(): string {
    return "docker-compose.mongodb.yml";
  }

  getDefaultCredentials(): string | null {
    return "mongodb://user:pass@localhost:27017/testdb";
  }

  // Document preparation
  prepareDocument<T extends object = object>(
    document: T,
    prepareOptions?: IPrepareOptions,
  ): T {
    return document;
  }
}

export class MockPostgresAdapter extends BaseDatabaseAdapter<{ uri: string }> {
  _adapter_type_ = "postgres";

  // Column normalization
  normalizeColumn(col: string): string {
    return col.toLowerCase();
  }

  // Connection management
  setConnectionName(...args: any[]): void {}

  getConnectionName(...args: any[]): string {
    return "sql";
  }

  async connectDefault(): Promise<unknown> {
    return true;
  }

  async isConnected(): Promise<boolean> {
    return true;
  }

  async close(): Promise<void> {}

  // Schema operations
  getSchema(): IDatabaseSchema {
    return MockSchema;
  }

  async createMigrationSchema(...args: any[]): Promise<unknown> {
    return undefined;
  }

  // Eloquent and relationships
  getEloquentConstructor<Model extends IModel = IModel>(): TClassConstructor<
    IEloquent<Model>
  > {
    return class MockEloquent {} as any;
  }

  getRelationshipResolver(): IRelationshipResolver {
    return MockRelationshipResolver;
  }

  // Configuration
  getDockerComposeFileName(): string {
    return "docker-compose.postgres.yml";
  }

  getDefaultCredentials(): string | null {
    return "postgres://user:pass@localhost:5432/testdb";
  }

  // Document preparation
  prepareDocument<T extends object = object>(
    document: T,
    prepareOptions?: IPrepareOptions,
  ): T {
    return document;
  }
}
