import { Str, checksumFile } from '@ben-shepherd/larascript-utils-bundle';
import { IMigration } from '@src/core/domains/migrations/interfaces/IMigration';
import FileNotFoundError from '@src/core/exceptions/FileNotFoundError';
import fs from 'fs';
import path from 'path';

const APP_MIGRATIONS_DIR = '@src/../src/app/migrations';

/**
 * Handles file operations for migrations
 */
class MigrationFileService {

    appMigrationsDir!: string;

    constructor(appMigrationsDir?: string) {
        this.appMigrationsDir = path.resolve(appMigrationsDir ?? APP_MIGRATIONS_DIR);
    }

    /**
     * Get the checksum of the specified file
     * @param fileName 
     * @returns 
     */
    checksum = async (fileName: string): Promise<string> => {
        if(!fileName.endsWith('.ts')) {
            fileName = `${fileName}.ts`;
        }
        
        return await checksumFile(path.resolve(this.appMigrationsDir, fileName));
    }

    /**
     * Get an instance of the class that implements IMigration from the specified file name
     * @param fileName 
     * @returns 
     */
    getImportMigrationClass = async (fileName: string): Promise<IMigration> => {
        if(!fileName.endsWith('.ts')) {
            fileName = `${fileName}.ts`;
        }

        const absolutePath = path.resolve(this.appMigrationsDir, fileName);

        if(!fs.existsSync(absolutePath)) {
            throw new FileNotFoundError(`File ${absolutePath} does not exist`);
        }

        const importedModule = await import(absolutePath);

        if(importedModule.default) {
            return new importedModule.default() as IMigration;
        }

        const exportedClass = Object.values(importedModule).find(
            (value): value is new () => IMigration => {
                return typeof value === 'function';
            } 
        );

        if(!exportedClass) {
            throw new Error(`File ${absolutePath} does not export expected class which implements IMigration`);
        }

        return new exportedClass();
    }

    /**
     * Get all migration file names from oldest to newest
     * @returns 
     */
    getMigrationFileNames(): string[] {
        const files = fs.readdirSync(this.appMigrationsDir)
        // Remove the .ts extension
            .map((file) => file.replace('.ts', ''))

        return files;
    }

    /**
     * Create a date filename
     * @param name 
     * @returns 
     */
    createDateFilename(name: string) {
        const date = new Date();
        const dateString = date.toISOString().split('T')[0]

        return `${dateString}-${Str.convertToSafeFileName(name.toLowerCase())}.ts`;
    }

    /**
     * Parse the date from the file name
     * Expected format: YYYY-MM-DD
     * @param fileName 
     * @returns 
     */
    parseDate(fileName: string): Date | null {
        const pattern = /^(\d{4})-(\d{2})-(\d{2})/;
        const match = pattern.exec(fileName);

        if(!match) {
            return null;
        }

        const [, year, month, day] = match;

        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 1, 1, 1)
    }

}

export default MigrationFileService