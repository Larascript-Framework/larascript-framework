import { app } from "@/core/services/App.js";
import { forEveryConnection } from "@/tests/testHelper.js";
import {
  IModelAttributes,
  Model,
} from "@larascript-framework/larascript-database";
import { DataTypes } from "sequelize";

const tableName = Model.formatTableName("testsPeople");

export interface ITestPeopleModelData extends IModelAttributes {
  id: string;
  name: string;
  age: number;
  born?: Date;
  roles: string[];
  createdAt: Date;
  updatedAt: Date;
}

export const resetPeopleTable = async () => {
  await forEveryConnection(async (connectionName) => {
    const schema = app("db").schema(connectionName);

    if (await schema.tableExists(tableName)) {
      await schema.dropTable(tableName);
    }

    await schema.createTable(tableName, {
      name: DataTypes.STRING,
      age: DataTypes.INTEGER,
      born: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      religion: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      roles: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
      },
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    });
  });
};

export default class TestPeopleModel extends Model<ITestPeopleModelData> {
  table = tableName;

  public fields: string[] = [
    "name",
    "age",
    "born",
    "religion",
    "roles",
    "createdAt",
    "updatedAt",
  ];

  jsonFields = ["roles"];
}
