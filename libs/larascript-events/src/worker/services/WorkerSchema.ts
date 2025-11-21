import { DataTypes } from "sequelize";
import WorkerModel from "../models/WorkerModel.js";

export class WorkerSchema {

    public static getSequelizeSchema(): Record<string, unknown> {
        return {
            [WorkerModel.QUEUE_NAME]: DataTypes.STRING,
            [WorkerModel.EVENT_NAME]: DataTypes.STRING,
            [WorkerModel.PAYLOAD]: DataTypes.JSON,
            [WorkerModel.ATTEMPTS]: DataTypes.INTEGER,
            [WorkerModel.RETRIES]: DataTypes.INTEGER,
            [WorkerModel.ERROR]: DataTypes.TEXT,
            [WorkerModel.UPDATED_AT]: DataTypes.DATE,
            [WorkerModel.DELETED_AT]: DataTypes.DATE,
            [WorkerModel.FAILED_AT]: DataTypes.DATE
        }
    }

}