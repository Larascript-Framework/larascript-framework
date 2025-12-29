import { IModelAttributes, Model } from "@/model/index.js";
import { TCastableType } from "@larascript-framework/cast-js";
import { Knex } from "knex";

export const resetTestPersonTable = async (knex: Knex) => {
    await knex.schema.dropTableIfExists('test_people');
    await knex.schema.createTable('test_people', (table) => {
        table.uuid('id').primary();
        table.string('name');
        table.integer('age');
        table.jsonb('address');
        table.jsonb('skills');
        table.date('createdAt');
        table.date('updatedAt');
    });
}

export interface TestPersonAttributes extends IModelAttributes
{
    name: string;
    age: number;
    address: {
        street: string;
        city: string;
        state: string;
        zip: string;
    };
    uncastedObject: object;
    skills: string[];
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
        'uncastedObject',
        'createdAt',
        'updatedAt'
    ]
    
    casts: Record<string, TCastableType> = {
        address: "object",
        skills: "array",
    };
}