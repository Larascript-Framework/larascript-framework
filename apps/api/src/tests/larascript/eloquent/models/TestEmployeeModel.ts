import { app } from "@/core/services/App.js";
import TestDepartmentModel from "@/tests/larascript/eloquent/models/TestDepartmentModel.js";
import testHelper from "@/tests/testHelper.js";
import { BelongsTo, IModelAttributes, Model } from "@larascript-framework/larascript-database";
import { DataTypes } from "sequelize";

const tableName = Model.formatTableName('testsEmployees')

export interface ITestEmployeeModelData extends IModelAttributes {
    deptId: string;
    name: string;
    age: number;
    salary: number;
    createdAt: Date;
    updatedAt: Date;
    department?: TestDepartmentModel
}

export const resetTableEmployeeModel = async (connections: string[] = testHelper.getTestConnectionNames()) => {
    for (const connectionName of connections) {
        const schema = app('db').schema(connectionName);

        if (await schema.tableExists(tableName)) {
            await schema.dropTable(tableName);
        }

        await schema.createTable(tableName, {
            deptId: { type: DataTypes.UUID, allowNull: true },
            name: DataTypes.STRING,
            age: DataTypes.INTEGER,
            salary: DataTypes.INTEGER,
            createdAt: DataTypes.DATE,
            updatedAt: DataTypes.DATE
        })
    }
}

export default class TestEmployeeModel extends Model<ITestEmployeeModelData> {

    table = tableName

    public fields: string[] = [
        'deptId',
        'name',
        'salary',
        'createdAt',
        'updatedAt'
    ];

    relationships = [
        'department'
    ]

    department(): BelongsTo {
        return this.belongsTo<TestDepartmentModel>(TestDepartmentModel, { localKey: 'deptId' });
    }

}