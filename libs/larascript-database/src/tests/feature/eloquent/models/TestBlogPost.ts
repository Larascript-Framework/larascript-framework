import DB from "@/database/services/DB.js";
import { testHelper } from "@/tests/tests-helper/testHelper.js";
import { IModelAttributes } from "@larascript-framework/contracts/database/model";
import { DataTypes, Model } from "sequelize";

const tableName = "testsBlogPosts";

export interface ITestsBlogPostsData extends IModelAttributes {
  id: string;
  title: string;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
}

export const resetTable = async (
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
      title: DataTypes.STRING,
      rating: DataTypes.INTEGER,
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    });
  }
};

export default class TestBlogPost extends Model<ITestsBlogPostsData> {
  table = tableName;

  public fields: string[] = ["name", "age", "createdAt", "updatedAt"];
}
