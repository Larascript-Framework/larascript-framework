import MigrationProvider from "@/core/providers/MigrationProvider.js";
import TestMigrationModel from "@/tests/larascript/migration/models/TestMigrationModel.js";
import { IMigrationConfig } from "@larascript-framework/contracts/migrations";
import path from "path";

class TestMigrationProvider extends MigrationProvider {
  protected config: IMigrationConfig = {
    keepProcessAlive: true,
    schemaMigrationDir: path.join(
      process.cwd(),
      "src/tests/larascript/migration/migrations",
    ),
    seederMigrationDir: path.join(
      process.cwd(),
      "src/tests/larascript/migration/seeders",
    ),
    modelCtor: TestMigrationModel,
  };
}

export default TestMigrationProvider;
