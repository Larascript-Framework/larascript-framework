import { IDatabaseSchema } from "@larascript-framework/contracts/database/database"
import ApiToken from "../models/ApiToken.js"
import { createApiTokenTable } from "./createApiTokenTable.js"

export const resetApiTokenTable = async (schema: IDatabaseSchema, additionalSchema: Record<string, unknown> = {}) => {
    const table = ApiToken.getTable()

    if(await schema.tableExists(table)) {
        await schema.dropTable(table)
    }

    await createApiTokenTable(schema, additionalSchema)
}