/* eslint-disable no-undef */
import SeedUpCommand from "@/migrations/commands/SeedUpCommand.js";
import { testHelper } from "@/tests/tests-helper/testHelper.js";
import { describe } from "@jest/globals";
import { DB, IDatabaseSchema } from "@larascript-framework/larascript-database";
import path from "path";
import { DataTypes } from "sequelize";
import { TestMigrationModel } from "./models/TestMigrationModel.js";

const dropAndCreateMigrationSchema = async () => {
  const migrationTable = "migrations";

  if (
    await DB.getInstance()
      .databaseService()
      .schema()
      .tableExists(migrationTable)
  ) {
    await DB.getInstance().databaseService().schema().dropTable(migrationTable);
  }

  await DB.getInstance()
    .databaseService()
    .createMigrationSchema(migrationTable);
};

const dropTestSchema = async () => {
  if (
    await DB.getInstance()
      .databaseService()
      .schema()
      .tableExists(TestMigrationModel.getTable())
  ) {
    await DB.getInstance()
      .databaseService()
      .schema()
      .dropTable(TestMigrationModel.getTable());
  }
};

describe("test migrations", () => {
  let schema: IDatabaseSchema;
  let tables: string[];

  let seederUpCommand: SeedUpCommand;

  beforeAll(async () => {
    await testHelper.testBootApp();

    seederUpCommand = new SeedUpCommand({
      keepProcessAlive: true,
      seederMigrationDir: path.join(
        process.cwd(),
        "src/tests/feature/migrations/seeders",
      ),
    });
    seederUpCommand.setOverwriteArg("group", "testing");
    seederUpCommand.setOverwriteArg("file", "test-seeder");

    await dropAndCreateMigrationSchema();
    await dropTestSchema();

    schema = DB.getInstance().databaseService().schema();

    // Re-create test table
    await schema.createTable(TestMigrationModel.getTable(), {
      name: DataTypes.STRING,
      age: DataTypes.INTEGER,
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    });

    tables = [TestMigrationModel.getTable()];
  });

  test("test up/down seeder", async () => {
    await seederUpCommand.execute();

    const john = await TestMigrationModel.query().where("name", "John").first();
    const jane = await TestMigrationModel.query().where("name", "Jane").first();

    expect(john?.name).toEqual("John");
    expect(john?.age).toEqual(20);
    expect(jane?.name).toEqual("Jane");
    expect(jane?.age).toEqual(21);
  });
});
