import { app } from "@/core/services/App.js";
import { db } from "@/core/services/DatabaseService.js";
import { queryBuilder } from "@/core/services/QueryBuilder.js";
import TestMigrationModel from "@/tests/larascript/migration/models/TestMigrationModel.js";
import testHelper from "@/tests/testHelper.js";
import { describe } from "@jest/globals";
import {
  IModelAttributes,
  Model,
} from "@larascript-framework/larascript-database";
import { DataTypes } from "sequelize";

export interface SeederTestModelAttributes extends IModelAttributes {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export class SeederTestModel extends Model<SeederTestModelAttributes> {
  public table: string = "seeder_test";

  public fields: string[] = ["name", "createdAt", "updatedAt"];
}

const resetTable = async () => {
  for (const connectionName of testHelper.getTestConnectionNames()) {
    const schema = db().schema(connectionName);

    // Drop migration
    if (await schema.tableExists(TestMigrationModel.getTable())) {
      await schema.dropTable(TestMigrationModel.getTable());
    }

    const tableName = SeederTestModel.getTable();

    if (await schema.tableExists(tableName)) {
      await schema.dropTable(tableName);
    }

    await schema.createTable(tableName, {
      name: DataTypes.STRING,
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    });
  }
};

describe("test seeders", () => {
  beforeAll(async () => {
    await testHelper.testBootApp();
  });

  test("test up seeder", async () => {
    // await dropAndCreateMigrationSchema()
    await resetTable();

    for (const connectionName of testHelper.getTestConnectionNames()) {
      const schema = db().schema(connectionName);

      await app("console")
        .readerService([
          "db:seed",
          "--group=testing",
          "--file=test-seeder-model",
        ])
        .handle();

      const tableExists = await schema.tableExists(SeederTestModel.getTable());
      expect(tableExists).toBe(true);

      const john = await queryBuilder(SeederTestModel)
        .where("name", "John")
        .firstOrFail();
      expect(john?.name).toEqual("John");

      const jane = await queryBuilder(SeederTestModel)
        .where("name", "Jane")
        .firstOrFail();
      expect(jane?.name).toEqual("Jane");
    }
  });
});
