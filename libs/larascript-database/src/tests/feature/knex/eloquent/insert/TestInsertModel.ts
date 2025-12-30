import { IModelAttributes, Model } from "@/model/index.js";
import { TCastableType } from "@larascript-framework/cast-js";
import { Knex } from "knex";

export const resetTestInsertModel = async (knex: Knex) => {
    await knex.schema.dropTableIfExists('test_people');
    await knex.schema.createTable('test_people', (table) => {
        table.uuid('id').primary();
        table.string('name');
        table.text('encryptedName');
        table.integer('age');
        table.text('encryptedAge');
        table.jsonb('address');
        table.text('encryptedAddress');
        table.jsonb('skills');
        table.text('encryptedSkills');
        table.timestamp('createdAt');
        table.timestamp('updatedAt');
    });
}

export interface TestInsertModelAttributes extends IModelAttributes
{
    name: string;
    encryptedName: string;
    age: number;
    encryptedAge: number;
    address: {
        street: string;
        city: string;
        state: string;
        zip: string;
    };
    encryptedAddress: {
        street: string;
        city: string;
        state: string;
        zip: string;
    }
    uncastedObject: object;
    skills: string[];
    createdAt: Date;
    updatedAt: Date;
}

export class TestinsertModel extends Model<TestInsertModelAttributes>
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
        encryptedName: "string",
        encryptedAge: "number",
        encryptedAddress: "object",
    };
}