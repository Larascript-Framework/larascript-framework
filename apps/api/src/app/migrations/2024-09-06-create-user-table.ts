import User from "@/app/models/auth/User.js";
import { createUserTable } from "@larascript-framework/larascript-auth";
import { BaseMigration } from "@larascript-framework/larascript-database";

export class CreateUserModelMigration extends BaseMigration {

    group?: string = 'app:setup';

    async up(): Promise<void> {
        await createUserTable(this.schema, {
            // Example:
            // age: {
            //     type: DataTypes.INTEGER,
            //     allowNull: true
            // },
        })
    }

    async down(): Promise<void> {
        await this.schema.dropTable(User.getTable());
    }

}