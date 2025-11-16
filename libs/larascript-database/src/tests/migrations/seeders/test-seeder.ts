import BaseSeeder from "@/migrations/base/BaseSeeder.js";
import { TestMigrationModel } from "../models/TestMigrationModel.js";

export class Seeder extends BaseSeeder {

    group?: string = 'testing';

    async up(): Promise<void> {
        
        const john = TestMigrationModel.create({ name: 'John', age: 20 })
        await john.save();

        const jane = TestMigrationModel.create({ name: 'Jane', age: 21 })
        await jane.save();

    }

}