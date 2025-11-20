import { MigrationModel, MigrationModelData } from "@larascript-framework/larascript-database";

/**
 * Model for test migrations stored in the database.
 */
class TestMigrationModel extends MigrationModel {

    constructor(data: MigrationModelData | null) {
        super(data);
    }

}

/**
 * The default migration model.
 */
export default TestMigrationModel
