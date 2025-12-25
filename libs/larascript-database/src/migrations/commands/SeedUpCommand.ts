import BaseMigrationCommand from "../base/BaseMigrationCommand.js";

class SeedUpCommand extends BaseMigrationCommand {
  /**
   * The signature of the command
   */
  public signature: string = "db:seed";

  description = "Run all seeders. Usage: db:seed --file=filename --group=group";

  /**
   * Execute the command
   */
  async execute() {
    // Read the arguments
    const file = this.getArguementByKey("file")?.value;
    const group = this.getArguementByKey("group")?.value;

    // Run the migrations
    const schemaMigrationService = this.getSeederMigrationService();
    await schemaMigrationService.boot();
    await schemaMigrationService.up({ filterByFileName: file, group: group });

    this.input.writeLine("Seeds up successfully");
  }
}

export default SeedUpCommand;
