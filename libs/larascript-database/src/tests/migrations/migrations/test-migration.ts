import { DB } from "@/database/index.js";
import BaseMigration from "@/migrations/base/BaseMigration.js";
import { DataTypes } from "sequelize";
import { TestMigrationModel } from "../models/TestMigrationModel.js";

class TestMigration extends BaseMigration {

    group?: string = 'testing';

    table = TestMigrationModel.getTable()

    async up(): Promise<void> {
        await DB.getInstance().databaseService().schema().createTable(this.table, {
            name: DataTypes.STRING,
            age: DataTypes.INTEGER
        })
    }

    async down(): Promise<void> {
        await DB.getInstance().databaseService().schema().dropTable(this.table)
    }

}

export default TestMigration