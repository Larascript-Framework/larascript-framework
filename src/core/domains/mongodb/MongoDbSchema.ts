import { captureError } from "@ben-shepherd/larascript-utils-bundle";
import BaseSchema from "@src/core/domains/database/base/BaseSchema";
import CreateDatabaseException from "@src/core/domains/database/exceptions/CreateDatabaseException";
import MongoDbAdapter from "@src/core/domains/mongodb/adapters/MongoDbAdapter";
import { app } from "@src/core/services/App";
import { logger } from "@src/core/services/Logger";

class MongoDBSchema extends BaseSchema<MongoDbAdapter> {

    /**
     * Creates a new database schema.
     * @param name The name of the database to create
     * @returns A promise that resolves when the database schema has been created
     */
    async createDatabase(name: string): Promise<void> {
        const client = await this.getAdapter().getMongoClientWithDatabase('app')

        try {
            const db = client.db(name);
            
            await db.createCollection("_schema");
        
            await db.collection("_schema").insertOne({
                databaseName: name
            });
            
            const exists = await this.databaseExists(name);

            if (!exists) {
                throw new CreateDatabaseException(`Failed to create database ${name}`);
            }
        }
        catch (err) {
            logger().error('Error creating database: ' + (err as Error).message);
            throw err;
        }
        finally {
            await client.close();
        }
    }

    /**
     * Checks if a database exists
     * @param name The name of the database to check
     * @returns A promise that resolves to a boolean indicating whether the database exists
     */
    async databaseExists(name: string): Promise<boolean> {
        const client = await this.getAdapter().getMongoClientWithDatabase('app')

        try {
            const adminDb = client.db().admin()
            const dbList = await adminDb.listDatabases();
            return dbList.databases.some(db => db.name === name);
        }
        catch (err) {
            logger().error('Error checking if database exists: ' + (err as Error).message);
            throw err;
        }
        finally {
            client.close()
        }

    }

    /**
     * Drops the specified database.
     * 
     * @param name - The name of the database to drop.
     * @returns A promise that resolves when the database has been dropped.
     */
    async dropDatabase(name: string): Promise<void> {
        const client = await this.getAdapter().getMongoClientWithDatabase('app');

        try {
            await client.db(name).dropDatabase();
        }
        catch (err) {
            logger().error('Error dropping database: ' + (err as Error).message);
            throw err;
        }
        finally {
            client.close()
        }
    }

    /**
     * Create a table
     * @param tableName 
     * @param args 
     */
    // eslint-disable-next-line no-unused-vars
    async createTable(tableName: string, ...args: any[]): Promise<void> {
        try {
            const adapter = this.getAdapter();
            
            await adapter.getDb().createCollection(tableName);
            await adapter.getDb().collection(tableName).insertOne({
                _create_table: true
            });
            await adapter.getDb().collection(tableName).deleteMany({
                _create_table: true
            });
        }
        catch (err) {
            logger().error('Error creating table: ' + (err as Error).message);
            throw err;
        }
    }

    /**
     * Drop a table
     * @param tableName 
     * @param args 
     */
    // eslint-disable-next-line no-unused-vars
    async dropTable(tableName: string, ...args: any[]): Promise<void> {
        try {
            await this.getAdapter().getDb().dropCollection(tableName);
        }
        catch (err) {
            logger().error('Error dropping table: ' + (err as Error).message);
            throw err;
        }
    }

    /**
     * Check if table exists
     * @param tableName 
     * @returns 
     */
    // eslint-disable-next-line no-unused-vars
    async tableExists(tableName: string, ...args: any[]): Promise<boolean> {
        return (await this.getAdapter().getDb().listCollections().toArray()).map(c => c.name).includes(tableName);
    }

    /**
     * Alter a table
     * @param name 
     * @param args 
     */
    // eslint-disable-next-line no-unused-vars
    alterTable(...args: any[]): Promise<void> {
        throw new Error("Method not implemented.");
    }

    /**
     * Drop all tables in the database
     *
     * @returns A promise resolving when all tables have been dropped
     */
    async dropAllTables(): Promise<void> {
        return captureError(async () => {
            const db = this.getAdapter().getDb();

            const collections = await db.listCollections().toArray();

            for(const collection of collections) {
                await db.dropCollection(collection.name);
            }
        }, (...args) => app('logger').info(...args))
    }

}

export default MongoDBSchema