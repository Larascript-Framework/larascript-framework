import { DB } from "@larascript-framework/larascript-database";
import BaseMigrationCommand from "../base/BaseMigrationCommand.js";

/**
 * MigrateFresh class handles running fresh migrations
 */
class MigrateFreshCommand extends BaseMigrationCommand {

    /**
     * The signature of the command
     */
    public signature: string = 'migrate:fresh';

    description = 'Drops all tables and runs fresh migrations';


    /**
     * Execute the command
     */
    async execute() {
        if (!await this.confirm()) {
            return;
        }

        // Check if the user wants to run seeds
        const seed: boolean = typeof this.getArguementByKey('seed')?.value === 'string';

        // Get the db schema helper
        const schema = DB.getInstance().databaseService().schema();

        // Drop all tables
        await schema.dropAllTables();

        // Handle migrate:up
        const console = DB.getInstance().console();
        await console.readerService(['migrate:up', '--keep-alive']).handle();

        if (seed) {
            await console.readerService(['db:seed']).handle();
        }

        this.input.writeLine('Migrations fresh successfully');
    }

    private async confirm(): Promise<boolean> {

        if (this.getArguementByKey('confirm')) {
            return true;
        }

        this.input.writeLine('--- Confirm Action ---');
        const answer = await this.input.askQuestion('Are you sure you want to drop all tables and run fresh migrations? (y/n)\n');
        return answer === 'y';

    }

}

export default MigrateFreshCommand
