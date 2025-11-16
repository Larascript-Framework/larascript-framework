import { IDatabaseSchema } from "@larascript-framework/contracts/database/database"
import User from "../models/User.js"
import { createUserTable } from "./createUserTable.js"

export const resetUserTable = async (schema: IDatabaseSchema, additionalSchema: Record<string, unknown> = {}) => {
    const table = User.getTable()

    if(await schema.tableExists(table)) {
        await schema.dropTable(table)
    }

    await createUserTable(schema, additionalSchema)
}