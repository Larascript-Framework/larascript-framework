import { ICommand } from "@larascript-framework/larascript-console";
import MigrateDownCommand from "../commands/MigrateDownCommand.js";
import MigrateFreshCommand from "../commands/MigrateFreshCommand.js";
import MigrateUpCommand from "../commands/MigrateUpCommand.js";
import SeedDownCommand from "../commands/SeedDownCommand.js";
import SeedUpCommand from "../commands/SeedUpCommand.js";

type Constructor<T> = new (...args: any[]) => T;

export class AvailableMigrationCommands {
  public static getCommands(): Constructor<ICommand>[] {
    return [
      MigrateUpCommand,
      MigrateDownCommand,
      MigrateFreshCommand,
      SeedUpCommand,
      SeedDownCommand,
    ];
  }
}

export default AvailableMigrationCommands;
