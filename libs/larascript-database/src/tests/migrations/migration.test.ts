/* eslint-disable no-undef */
import MigrateDownCommand from '@/migrations/commands/MigrateDownCommand.js';
import MigrateUpCommand from '@/migrations/commands/MigrateUpCommand.js';
import { describe } from '@jest/globals';
import { DB, IDatabaseSchema } from '@larascript-framework/larascript-database';
import path from 'path';
import { testHelper } from '../tests-helper/testHelper.js';
import { TestMigrationModel } from './models/TestMigrationModel.js';

const dropAndCreateMigrationSchema = async () => {
    const migrationTable = 'migrations'

    if (await DB.getInstance().databaseService().schema().tableExists(migrationTable)) {
        await DB.getInstance().databaseService().schema().dropTable(migrationTable);
    }

    await DB.getInstance().databaseService().createMigrationSchema(migrationTable)
}

const dropTestSchema = async () => {
    if (await DB.getInstance().databaseService().schema().tableExists('tests')) {
        await DB.getInstance().databaseService().schema().dropTable('tests');
    }

}


describe('test migrations', () => {

    let schema: IDatabaseSchema;
    let tables: string[];

    let migrationUpCommand: MigrateUpCommand;
    let migrationDownCommand: MigrateDownCommand;

    beforeAll(async () => {
        await testHelper.testBootApp()

        migrationUpCommand = new MigrateUpCommand({
            keepProcessAlive: true,
            schemaMigrationDir: path.join(process.cwd(), 'src/tests/migrations/migrations'),
        });
        migrationUpCommand.setOverwriteArg('group', 'testing');
        migrationUpCommand.setOverwriteArg('file', 'test-migration');

        migrationDownCommand = new MigrateDownCommand({
            keepProcessAlive: true,
            schemaMigrationDir: path.join(process.cwd(), 'src/tests/migrations/migrations'),
        });
        migrationDownCommand.setOverwriteArg('group', 'testing');
        migrationDownCommand.setOverwriteArg('file', 'test-migration');

        
        await dropAndCreateMigrationSchema()
        await dropTestSchema()
        schema = DB.getInstance().databaseService().schema();

        tables = [
            TestMigrationModel.getTable(),
        ]

    });

    // afterAll(async () => {
    //     await DB.getInstance().databaseService().schema().dropTable('tests');
    //     await DB.getInstance().databaseService().schema().dropTable('migrations');
    // })

    test('test up/down migration', async () => {

        await migrationUpCommand.execute();

        for (const table of tables) {
            const tableExists = await schema.tableExists(table);
            expect(tableExists).toBe(true);
        }

        await migrationDownCommand.execute();

        for (const table of tables) {
            const tableExists = await schema.tableExists(table);
            expect(tableExists).toBe(false);
        }
    });

});