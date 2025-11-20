import { app } from "@/core/services/App.js";
import TestModel from "@/tests/larascript/models/models/TestModel.js";
import { BaseMigration } from "@larascript-framework/larascript-database";
import { DataTypes } from "sequelize";

export const testMigrationTables = () => [
    TestModel.getTable()
]

export const dropTestMigrationTables = async () => {
    if(await app('db').schema().tableExists(TestModel.getTable())) {
        await app('db').schema().dropTable(TestModel.getTable())
    }
}

class TestMigration extends BaseMigration {

    group?: string = 'testing';

    async up(): Promise<void> {
        await app('db').schema().createTable(TestModel.getTable(), {
            name: DataTypes.STRING
        })
    }

    async down(): Promise<void> {
        await app('db').schema().dropTable(TestModel.getTable())
    }

}

export default TestMigration