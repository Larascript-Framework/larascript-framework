import { BaseMigration } from "@larascript-framework/larascript-database";
import { WorkerModel, WorkerSchema } from "@larascript-framework/larascript-events";

export class CreateWorkerTableMigration extends BaseMigration {

    // Specify the database provider if this migration should run on a particular database.
    // Uncomment and set to 'mongodb', 'postgres', or another supported provider.
    // If left commented out, the migration will run only on the default provider.
    // databaseProvider: 'mongodb' | 'postgres' = 'postgres';

    group?: string = 'app:setup';

    table = WorkerModel.getTable()

    async up(): Promise<void> {
        await this.schema.createTable(this.table, WorkerSchema.getSequelizeSchema());
    }

    async down(): Promise<void> {
        await this.schema.dropTable(this.table);
    }

}