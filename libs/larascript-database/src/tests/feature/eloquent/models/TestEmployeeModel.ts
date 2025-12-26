import { DB } from "@/database/index.js";
import BelongsTo from "@/eloquent/relational/BelongsTo.js";
import { IModelAttributes, Model } from "@/model/index.js";
import { testHelper } from "@/tests/tests-helper/testHelper.js";
import { DataTypes } from "sequelize";
import TestDepartmentModel from "./TestDepartmentModel.js";

const tableName = Model.formatTableName("testsEmployees");

export interface ITestEmployeeModelData extends IModelAttributes {
  deptId: string;
  name: string;
  age: number;
  salary: number;
  createdAt: Date;
  updatedAt: Date;
  department?: TestDepartmentModel;
}

export const resetTableEmployeeModel = async (
  connections: string[] = testHelper.getTestConnectionNames(),
) => {
  for (const connectionName of connections) {
    const schema = DB.getInstance()
      .databaseService()
      .getAdapter(connectionName)
      .getSchema();

    if (await schema.tableExists(tableName)) {
      await schema.dropTable(tableName);
    }

    await schema.createTable(tableName, {
      deptId: { type: DataTypes.UUID, allowNull: true },
      name: DataTypes.STRING,
      age: DataTypes.INTEGER,
      salary: DataTypes.INTEGER,
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    });
  }
};

export default class TestEmployeeModel extends Model<ITestEmployeeModelData> {
  table = tableName;

  public fields: string[] = [
    "deptId",
    "name",
    "salary",
    "createdAt",
    "updatedAt",
  ];

  relationships = ["department"];

  department(): BelongsTo {
    return this.belongsTo<TestDepartmentModel>(TestDepartmentModel, {
      localKey: "deptId",
    });
  }
}
