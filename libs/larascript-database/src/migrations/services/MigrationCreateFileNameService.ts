import { IMigrationCreateFileNameService } from "@larascript-framework/contracts/migrations";
import { Str } from "@larascript-framework/larascript-utils";

export class MigrationCreateFileNameService implements IMigrationCreateFileNameService {
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
}

export default MigrationCreateFileNameService;