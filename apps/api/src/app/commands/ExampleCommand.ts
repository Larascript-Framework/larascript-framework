import { BaseCommand } from "@larascript-framework/larascript-console";

export default class ExampleCommand extends BaseCommand {
  signature: string = "app:example";

  async execute() {
    // Handle the logic
  }
}
