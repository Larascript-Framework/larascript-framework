import { IModelAttributes, Model } from "@larascript-framework/larascript-database";

export interface TestModelData extends IModelAttributes {
    name: string
}

class TestModel extends Model<TestModelData> {

    public table: string = 'tests';

    public fields: string[] = [
        'name',
        'createdAt',
        'updatedAt'
    ]

}

export default TestModel