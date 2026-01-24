import { app } from "@/core/services/App.js";
import TestEmployeeModel from "@/tests/larascript/eloquent/models/TestEmployeeModel.js";
import testHelper from "@/tests/testHelper.js";
import { Collection } from "@larascript-framework/larascript-collection";
import {
  HasMany,
  IModelAttributes,
  Model,
} from "@larascript-framework/larascript-database";
import { DataTypes } from "sequelize";

const tableName = Model.formatTableName("testsDepartments");

export interface ITestDepartmentModelData extends IModelAttributes {
  deptId: string;
  deptName: string;
  createdAt: Date;
  updatedAt: Date;
  employees?: Collection<TestEmployeeModel>;
}

export const resetTableDepartmentModel = async (
  connections: string[] = testHelper.getTestConnectionNames(),
) => {
  for (const connectionName of connections) {
    const schema = app("db").schema(connectionName);

    if (await schema.tableExists(tableName)) {
      await schema.dropTable(tableName);
    }

    await schema.createTable(tableName, {
      deptName: DataTypes.STRING,
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    });
  }
};

export default class TestDepartmentModel extends Model<ITestDepartmentModelData> {
  table = tableName;

  public fields: string[] = ["deptName", "createdAt", "updatedAt"];

  public relationships: string[] = ["employees"];

  employees(): HasMany {
    return this.hasMany(TestEmployeeModel, {
      foreignKey: "deptId",
      localKey: "id",
    });
  }
}
