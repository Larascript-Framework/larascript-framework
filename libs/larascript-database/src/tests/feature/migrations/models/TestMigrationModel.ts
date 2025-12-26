import {
  IModelAttributes,
  Model,
} from "@larascript-framework/larascript-database";

export interface TestMigrationModelAttributes extends IModelAttributes {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export class TestMigrationModel extends Model<TestMigrationModelAttributes> {
  public table: string = "test_migration";

  public fields: string[] = ["name", "age", "createdAt", "updatedAt"];
}
