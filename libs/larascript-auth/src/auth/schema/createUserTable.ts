import { IDatabaseSchema } from "@larascript-framework/contracts/database/database"
import { DataTypes } from "sequelize"
import User from "../models/User.js"

export const createUserTable = async (schema: IDatabaseSchema, additionalSchema: Record<string, unknown> = {}) => {
    const table = User.getTable()

    if(await schema.tableExists(table)) {
        return;
    }

    await schema.createTable(table, {
        // Include required fields for authentication
        email: DataTypes.STRING,
        hashedPassword: DataTypes.STRING,

        // ACL fields
        aclRoles: DataTypes.ARRAY(DataTypes.STRING),
        aclGroups: DataTypes.ARRAY(DataTypes.STRING),

        // User fields
        firstName: {
            type: DataTypes.STRING,
            allowNull: true
        },
        lastName: {
            type: DataTypes.STRING,
            allowNull: true
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
        
        ...additionalSchema

    })
}