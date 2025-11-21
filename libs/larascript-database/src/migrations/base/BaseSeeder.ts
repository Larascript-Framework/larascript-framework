import { MigrationType } from "../interfaces/index.js";
import BaseMigration from "./BaseMigration.js";

/**
 * BaseSeeder class serves as the foundation for all database seeders.
 */
export abstract class BaseSeeder extends BaseMigration {

    /**
     * The type of migration
     */
    migrationType = 'seeder' as MigrationType;

    /**
     * Optional down method.
     *
     * @return {Promise<void>}
     */
    down(): Promise<void> {
        return Promise.resolve();
    }

}

export default BaseSeeder;