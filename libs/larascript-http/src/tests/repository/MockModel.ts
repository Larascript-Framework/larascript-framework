import { IModelAttributes } from "@larascript-framework/contracts/database/model";
import { Model } from "@larascript-framework/larascript-database";

export interface MockModelAttributes extends IModelAttributes {
    id: string;
    name: string;
    age: number;
    secret: string;
    createdAt: Date;
    updatedAt: Date;
}

export class MockModel extends Model<MockModelAttributes> {
    constructor(data: MockModelAttributes | null = null) {
        super(data);
    }

    fields = [
        'id',
        'name',
        'age',
        'secret',
        'userId',
        'createdAt',
        'updatedAt',
    ]

    guarded = [
        'secret',
    ]
}