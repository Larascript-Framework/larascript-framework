import ICommandBootService from "@/core/interfaces/ICommandBootService.js";
import { KernelOptions } from "@larascript-framework/contracts/larascript-core";
import { AppSingleton } from "@larascript-framework/larascript-core";

class CommandBootService implements ICommandBootService {
  /**
   * Execute commands
   * @param args
   * @throws CommandNotFoundException
   */
  async boot(args: string[]): Promise<void> {
    await AppSingleton.container("console").readerService(args).handle();
  }

  /**
   * Get the kernel options
   * If a command is detected, we will exclude Express and Routes from being loaded.
   * @param args
   * @param options
   * @returns
   */
  getKernelOptions = (
    args: string[],
    options: KernelOptions,
  ): KernelOptions => {
    options.withoutProvider = [...(options.withoutProvider ?? [])];

    if (args.includes("--no-express")) {
      options.withoutProvider.push("ExpressProvider");
      options.withoutProvider.push("RoutesProvider");
    }
    if (args.includes("--no-auth")) {
      options.withoutProvider.push("AuthProvider");
    }
    if (args.includes("--no-db")) {
      options.withoutProvider?.push("MongoDBProvider");
    }

    return options;
  };
}

export default CommandBootService;
