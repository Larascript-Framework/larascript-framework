import { IMigration } from "./IMigration.js";

export interface IMigrationFileService {
    appMigrationsDir: string;

    checksum(fileName: string): Promise<string>;

    getImportMigrationClass(fileName: string): Promise<IMigration>;

    getMigrationFileNames(): string[];

    createDateFilename(name: string): string;

    parseDate(fileName: string): Date | null;
}
