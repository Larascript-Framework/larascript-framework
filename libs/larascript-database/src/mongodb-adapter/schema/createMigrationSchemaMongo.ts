import { MongoDbAdapter } from "../adapters/index.js";

/**
 * Creates the migrations schema for MongoDB
 *
 * @returns {Promise<void>}
 */
const createMigrationSchemaMongo = async (
  adapter: MongoDbAdapter,
  tableName: string = "migrations",
) => {
  const db = adapter.getDb();

  if (
    (await db.listCollections().toArray())
      .map((c) => c.name)
      .includes(tableName)
  ) {
    return;
  }

  await db.createCollection(tableName);
};

export default createMigrationSchemaMongo;
