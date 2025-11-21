import { TClassConstructor } from "@/core/constructor.js";
import { IDatabaseAdapter } from "../database/database/adapter.js";

/**
 * The type of migration
 */
export type MigrationType = 'schema' | 'seeder';

export interface IMigration {

    /**
     * This should be set only if this migration should run on a specific database provider
     */
    databaseAdapter?:  TClassConstructor<IDatabaseAdapter>;

    /**
     * Specify the group this migration belongs to
     */
    group?: string;

    /**
     * Specify the type of migration
     */
    migrationType: 'schema' | 'seeder';

    /**
     * Run the migrations up
     */
    up(): Promise<void>

    /**
     * Run the migrations down
     */
    down(): Promise<void>

    /**
     * Check if the current database provider matches databaseProvider
     */
    shouldUp(): boolean;
}