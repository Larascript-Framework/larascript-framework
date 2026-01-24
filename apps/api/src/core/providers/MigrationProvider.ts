import { app } from "@/core/services/App.js";
import { AbstractProvider } from "@larascript-framework/bootstrap";
import { IMigrationConfig } from "@larascript-framework/contracts/migrations";
import { AvailableMigrationCommands } from "@larascript-framework/larascript-database";

/**
 * MigrationProvider class handles all migration related tasks
 */
class MigrationProvider extends AbstractProvider {
  protected config: IMigrationConfig = {
    schemaMigrationDir: "src/app/migrations",
    seederMigrationDir: "src/app/seeders",
  };

  async register(): Promise<void> {
    app("console")
      .registerService()
      .registerAll(AvailableMigrationCommands.getCommands(), this.config);
  }
}

export default MigrationProvider;
