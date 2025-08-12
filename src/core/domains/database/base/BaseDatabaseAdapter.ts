/* eslint-disable no-unused-vars */
import { BaseConfig } from "@ben-shepherd/larascript-core";
import { IDatabaseAdapter } from "@src/core/domains/database/interfaces/IDatabaseAdapter";
import { IDatabaseGenericConnectionConfig } from "@src/core/domains/database/interfaces/IDatabaseConfig";
import { IDatabaseSchema } from "@src/core/domains/database/interfaces/IDatabaseSchema";
import { IPrepareOptions } from "@src/core/domains/database/interfaces/IPrepareOptions";
import BaseRelationshipResolver from "@src/core/domains/eloquent/base/BaseRelationshipResolver";
import { IEloquent } from "@src/core/domains/eloquent/interfaces/IEloquent";
import { IRelationshipResolver } from "@src/core/domains/eloquent/interfaces/IEqloeuntRelationship";
import { IModel } from "@src/core/domains/models/interfaces/IModel";
import { TClassConstructor } from "@src/core/interfaces/ClassConstructor.t";

abstract class BaseDatabaseAdapter<TConfig extends object = object> extends BaseConfig implements IDatabaseAdapter {

    /**
     * Database config
     */
    protected config!: IDatabaseGenericConnectionConfig<TConfig>;

    /**
     * Database connection name
     */
    protected connectionName!: string;

    /**
     * Docker compose file name
     */
    protected dockerComposeFileName!: string;

    /**
     * Set the connection name
     * @param connectionName The name of the connection
     */
    setConnectionName(connectionName: string): void {
        this.connectionName = connectionName
    }

    /**
     * Get the connection name
     * @returns The connection name
     */
    getConnectionName(): string {
        return this.connectionName
    }

    /**
     * Retrieves the name of the Docker Compose file associated with the database.
     *
     * @returns {string} The Docker Compose file name.
     */
    getDockerComposeFileName(): string {
        if (!this.dockerComposeFileName) {
            throw new Error('Docker compose file name not set')
        }
        return this.dockerComposeFileName
    }

    /**
     * Get the relationship resolver constructor
     */
    getRelationshipResolver(): IRelationshipResolver {
        return new BaseRelationshipResolver(this.connectionName)
    }

    /**
     * Nomralize the primary key
     */
    normalizeColumn(col: string) {
        return col
    }

    /**
     * Connect to the default database
     */
    abstract connectDefault(): Promise<unknown>;

    /**
     * Check if the database is connected
     */
    abstract isConnected(): Promise<boolean>;

    /**
     * Get the database schema manager
     */
    abstract getSchema(): IDatabaseSchema;

    /**
     * Get the Eloquent constructor
     */
    abstract getEloquentConstructor<Model extends IModel = IModel>(): TClassConstructor<IEloquent<Model>>;

    /**
     * Get the default credentials
     */
    abstract getDefaultCredentials(): string | null;

    /**
     * Create a migration schema
     */
    abstract createMigrationSchema(...args: any[]): Promise<unknown>;

    /**
     * Close the database connection
     */
    abstract close(): Promise<void>;

    /**
     * Prepare a document for insertion or update.
     * 
     * @param document - The document to prepare.
     * @param prepareOptions - Optional preparation options.
     * @returns {T} The prepared document.
     * @template T - The type of the prepared document.
     */
    prepareDocument<T extends object = object>(document: T, prepareOptions?: IPrepareOptions): T {
        const preparedDocument: T = { ...document }

        for (const key in preparedDocument) {
            if (prepareOptions?.jsonStringify?.includes(key)) {
                if (typeof preparedDocument[key as string] === 'object') {
                    preparedDocument[key as string] = JSON.stringify(preparedDocument[key as string])
                }
            }
            if (prepareOptions?.jsonParse?.includes(key)) {
                if (typeof preparedDocument[key as string] === 'string') {
                    preparedDocument[key as string] = JSON.parse(preparedDocument[key as string])
                }
            }
        }

        return preparedDocument
    }

}

export default BaseDatabaseAdapter