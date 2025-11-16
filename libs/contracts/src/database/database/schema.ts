export interface IDatabaseSchema {
  createDatabase(name: string): Promise<void>;
  databaseExists(name: string): Promise<boolean>;
  dropDatabase(name: string): Promise<void>;
  createTable(name: string, ...args: any[]): Promise<void>;
  dropTable(name: string, ...args: any[]): Promise<void>;
  tableExists(name: string): Promise<boolean>;
  alterTable(name: string, ...args: any[]): Promise<void>;
  dropAllTables(): Promise<void>;
}
