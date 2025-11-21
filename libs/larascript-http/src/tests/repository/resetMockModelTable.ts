import { DB } from "@larascript-framework/larascript-database";
import { DataTypes } from "sequelize";
import { MockModel } from "./MockModel.js";

export const resetMockModelTable = async () => {
    const tableName = MockModel.getTable();
    const schema = {
        name: DataTypes.STRING,
        age: DataTypes.INTEGER,
        secret: DataTypes.STRING,
        userId: DataTypes.STRING,
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
    }

    if(await DB.getInstance().databaseService().postgres().getSchema().tableExists(tableName)) {
        await DB.getInstance().databaseService().postgres().getSchema().dropTable(tableName);
    }

    await DB.getInstance().databaseService().postgres().getSchema().createTable(tableName, schema);
}