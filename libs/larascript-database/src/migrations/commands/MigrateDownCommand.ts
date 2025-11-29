import BaseMigrationCommand from "../base/BaseMigrationCommand.js";

class MigrateDownCommand extends BaseMigrationCommand {
  /**
   * Signature for the command.
   */
  public signature: string = "migrate:down";

  description = "Rollback migrations";

  /**
   * Execute the command.
   */
  async execute() {
    // Read the arguments
    const batch = this.getArguementByKey("batch")?.value;

    // Run the migrations
    const schemaMigrationService = this.getSchemaMigrationService();
    await schemaMigrationService.boot();
    await schemaMigrationService.down({
      batch: batch ? parseInt(batch) : undefined,
    });

    this.input.writeLine("Migrations down successfully");
  }
}

export default MigrateDownCommand;
