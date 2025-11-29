import BaseMigrationCommand from "../base/BaseMigrationCommand.js";

/**
 * MigrateUpCommand class handles running up migrations
 */
class MigrateUpCommand extends BaseMigrationCommand {
  /**
   * The signature of the command
   */
  public signature: string = "migrate:up";

  description = "Run up migrations";

  /**
   * Execute the command
   */
  async execute() {
    // Read the arguments
    const file = this.getArguementByKey("file")?.value;
    const group = this.getArguementByKey("group")?.value;
    const keepAlive =
      typeof this.getArguementByKey("keep-alive")?.value === "string";

    // If this command is called with --keep-alive, then keep the process alive
    // For example, migrate:fresh --seed will also to keep the process alive to run the seeds
    if (keepAlive) {
      this.config.keepProcessAlive = true;
    }

    // Run the migrations
    const schemaMigrationService = this.getSchemaMigrationService();
    await schemaMigrationService.boot();
    await schemaMigrationService.up({ filterByFileName: file, group: group });

    this.input.writeLine("Migrations up successfully");
  }
}

export default MigrateUpCommand;
