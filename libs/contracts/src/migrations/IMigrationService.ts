import { MigrationType } from "./IMigration.js";

/* eslint-disable no-unused-vars */
export interface IMigrationServiceOptions {
    filterByFileName?: string
    group?: string
    batch?: number
}

export interface IMigrationService {
    boot(): Promise<void>;
    up(options: IMigrationServiceOptions): Promise<void>;
    down(options: IMigrationServiceOptions): Promise<void>;
    getMigrationType(): MigrationType;
}