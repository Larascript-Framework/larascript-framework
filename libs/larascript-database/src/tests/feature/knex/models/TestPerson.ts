import { IModelAttributes, Model } from "@/model/index.js";
import { Knex } from "knex";

export const resetTestPersonTable = async (knex: Knex) => {
    await knex.schema.dropTableIfExists('test_people');
    await knex.schema.createTable('test_people', (table) => {
        table.uuid('id').primary();
        table.string('name');
        table.integer('age');
        table.date('createdAt');
        table.date('updatedAt');
    });
}

export interface TestPersonAttributes extends IModelAttributes
{
    name: string;
    age: number;
    createdAt: Date;
    updatedAt: Date;
}

export class TestPerson extends Model<TestPersonAttributes>
{
    table: string = 'test_people';

    fields: string[] = [
        'id',
        'name',
        'age',
        'createdAt',
        'updatedAt'
    ]
    
}