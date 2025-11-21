import { DB } from "@/database/index.js";
import { IModelAttributes, Model } from "@/model/index.js";
import { forEveryConnection } from "@/tests/tests-helper/forEveryConnection.js";
import { DataTypes } from "sequelize";

interface TestDirtyModelAttributes extends IModelAttributes {
  name: string;
  array: string[];
  object: object;
}

export const resetDirtyTable = async () => {
  const tableName = TestDirtyModel.getTable();

  await forEveryConnection(async (connectionName) => {
    const schema = DB.getInstance().databaseService().schema(connectionName);

    if (await schema.tableExists(tableName)) {
      await schema.dropTable(tableName);
    }

    await schema.createTable(tableName, {
      name: DataTypes.STRING,
      array: DataTypes.ARRAY(DataTypes.STRING),
      object: DataTypes.JSON,
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    });
  });
};

class TestDirtyModel extends Model<TestDirtyModelAttributes> {
  public table: string = "tests";

  public fields: string[] = [
    "name",
    "array",
    "object",
    "createdAt",
    "updatedAt",
  ];

  public json: string[] = ["object"];
}

export default TestDirtyModel;
