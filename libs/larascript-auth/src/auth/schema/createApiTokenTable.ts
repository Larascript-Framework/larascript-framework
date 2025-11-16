import { IDatabaseSchema } from "@larascript-framework/contracts/database/database"
import { DataTypes } from "sequelize"
import ApiToken from "../models/ApiToken.js"

export const createApiTokenTable = async (schema: IDatabaseSchema, additionalSchema: Record<string, unknown> = {}) => {
    const table = ApiToken.getTable()

    if(await schema.tableExists(table)) {
        return;
    }

    await schema.createTable(table, {
        userId: DataTypes.STRING,
        token: DataTypes.STRING,
        scopes: DataTypes.JSON,
        options: DataTypes.JSON,
        revokedAt: DataTypes.DATE,
        expiresAt: DataTypes.DATE,
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
        ...additionalSchema
    })
}