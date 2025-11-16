import { DB } from "@/database/index.js";
import { IModelAttributes, Model } from "@/model/index.js";
import { forEveryConnection } from "@/tests/tests-helper/forEveryConnection.js";
import { DataTypes } from "sequelize";

export interface TestEncryptionModelAttributes extends IModelAttributes {
  id: string;
  secret: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export const resetEncryptionTable = async () => {
  const tableName = TestEncryptionModel.getTable();

  await forEveryConnection(async (connectionName) => {
    const schema = DB.getInstance().databaseService().schema(connectionName);

    if (await schema.tableExists(tableName)) {
      await schema.dropTable(tableName);
    }

    await schema.createTable(tableName, {
      secret: DataTypes.STRING,
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    });
  });
};

class TestEncryptionModel extends Model<TestEncryptionModelAttributes> {
  public table: string = "testsEncryption";

  public fields: string[] = ["secret", "createdAt", "updatedAt"];

  public encrypted: string[] = ["secret"];
}

export default TestEncryptionModel;
