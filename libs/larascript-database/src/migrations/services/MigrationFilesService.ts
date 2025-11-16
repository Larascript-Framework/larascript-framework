import { checksumFile } from '@larascript-framework/larascript-utils';
import fs from 'fs';
import path from 'path';
import FileNotFoundError from '../exceptions/FileNotFoundError.js';
import { IMigration } from '../interfaces/index.js';

/**
 * Handles file operations for migrations
 */
export class MigrationFileService {

    constructor(protected appMigrationsDir: string) {}

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

        const importPath = path.join(this.appMigrationsDir, fileName);

        if(!fs.existsSync(importPath)) {
            throw new FileNotFoundError(`File ${importPath} does not exist`);
        }

        const importedModule = await import(importPath);

        if(importedModule.default) {
            return new importedModule.default() as IMigration;
        }

        const exportedClass = Object.values(importedModule).find(
            (value): value is new () => IMigration => {
                return typeof value === 'function';
            } 
        );

        if(!exportedClass) {
            throw new Error(`File ${importPath} does not export expected class which implements IMigration`);
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