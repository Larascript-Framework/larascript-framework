import { TCastableType } from "@ben-shepherd/larascript-utils";
import Model from "@src/core/domains/models/base/Model";
import { IModelAttributes } from "@src/core/domains/models/interfaces/IModel";
import { app } from "@src/core/services/App";
import { forEveryConnection } from "@src/tests/testHelper";
import { DataTypes } from "sequelize";

const tableName = Model.formatTableName('testsEmails')

export interface ITestEmailModelData extends IModelAttributes {
    username: string;
    email: string;
    deletedAt: Date;
    createdAt: Date;
    updatedAt: Date;

}

export const resetEmailTable = async () => {
    await forEveryConnection(async connectionName => {
        const schema = app('db').schema(connectionName);

        if (await schema.tableExists(tableName)) {
            await schema.dropTable(tableName);
        }

        await schema.createTable(tableName, {
            username: DataTypes.STRING,
            email: DataTypes.STRING,
            deletedAt: DataTypes.DATE,
            createdAt: DataTypes.DATE,
            updatedAt: DataTypes.DATE
        })
    })
}

export default class TestEmailModel extends Model<ITestEmailModelData> {

    table = tableName

    public fields: string[] = [
        'username',
        'email',
        'deletedAt',
        'createdAt',
        'updatedAt'
    ];

    public casts: Record<string, TCastableType> = {
        deletedAt: 'date'
    }

}