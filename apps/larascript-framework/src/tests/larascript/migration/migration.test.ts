/* eslint-disable no-undef */
import { app } from '@/core/services/App.js';
import TestMigrationModel from '@/tests/larascript/migration/models/TestMigrationModel.js';
import testHelper from '@/tests/testHelper.js';
import { describe } from '@jest/globals';
import { IDatabaseSchema } from '@larascript-framework/larascript-database';
import { dropTestMigrationTables, testMigrationTables } from './migrations/test-migration.js';

const dropAndCreateMigrationSchema = async () => {
    const migrationTable = new TestMigrationModel(null).table

    if (await app('db').schema().tableExists(migrationTable)) {
        await app('db').schema().dropTable(migrationTable);
    }

    await app('db').createMigrationSchema(migrationTable)
}

describe('test migrations', () => {

    let schema: IDatabaseSchema;

    beforeAll(async () => {
        await testHelper.testBootApp()

        console.log('Connection', app('db').getDefaultConnectionName())

        await dropAndCreateMigrationSchema()

        await dropTestMigrationTables()

        schema = app('db').schema();
    });

    afterAll(async () => {
        await dropTestMigrationTables()
        await app('db').schema().dropTable('migrations');
    })

    test('test up migration', async () => {

        await app('console').readerService(['migrate:up', '--group=testing']).handle();

        for (const table of testMigrationTables()) {
            console.log('checking if table exists', table)
            const tableExists = await schema.tableExists(table);
            console.log('tableExists (expect: true)', table, tableExists)
            expect(tableExists).toBe(true);
        }
    });

    test('test down migration', async () => {

        await app('console').readerService(['migrate:down', '--group=testing']).handle();

        for (const table of testMigrationTables()) {
            const tableExists = await schema.tableExists(table);
            console.log('tableExists (expect: false)', table, tableExists)
            expect(tableExists).toBe(false);
        }

    });

});