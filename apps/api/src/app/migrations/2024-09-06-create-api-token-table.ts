import { createApiTokenTable } from "@larascript-framework/larascript-auth";
import { BaseMigration } from "@larascript-framework/larascript-database";
;

export class CreateApiTokenMigration extends BaseMigration {

    group?: string = 'app:setup';

    async up(): Promise<void> {
        await createApiTokenTable(this.schema)
    }

}