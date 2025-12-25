import { app } from "@/core/services/App.js";
import { forEveryConnection } from "@/tests/testHelper.js";
import { TCastableType } from "@larascript-framework/cast-js";
import {
  IModelAttributes,
  Model,
} from "@larascript-framework/larascript-database";
import { DataTypes } from "sequelize";

const tableName = Model.formatTableName("testsEmails");

export interface ITestEmailModelData extends IModelAttributes {
  username: string;
  email: string;
  deletedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const resetEmailTable = async () => {
  await forEveryConnection(async (connectionName) => {
    const schema = app("db").schema(connectionName);

    if (await schema.tableExists(tableName)) {
      await schema.dropTable(tableName);
    }

    await schema.createTable(tableName, {
      username: DataTypes.STRING,
      email: DataTypes.STRING,
      deletedAt: DataTypes.DATE,
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    });
  });
};

export default class TestEmailModel extends Model<ITestEmailModelData> {
  table = tableName;

  public fields: string[] = [
    "username",
    "email",
    "deletedAt",
    "createdAt",
    "updatedAt",
  ];

  public casts: Record<string, TCastableType> = {
    deletedAt: "date",
  };
}
