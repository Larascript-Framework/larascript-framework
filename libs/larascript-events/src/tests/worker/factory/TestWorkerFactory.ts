import { generateUuidV4 } from "@larascript-framework/larascript-utils";
import { IWorkerAttributes, IWorkerModel, IWorkerModelFactory } from "../../../worker/index.js";
import TestFailedWorkerModel from "../models/TestFailedWorkerModel.js";
import TestWorkerModel from "../models/TestWorkerModel.js";

export class TestWorkerFactory implements IWorkerModelFactory {

    createWorkerModel(data: IWorkerAttributes): IWorkerModel {
        return new TestWorkerModel(data);
    }

    createFailedWorkerModel(data: IWorkerAttributes): IWorkerModel {
        if(!data.id) {
            data.id = generateUuidV4();
        }
        return new TestFailedWorkerModel(data);
    }
}