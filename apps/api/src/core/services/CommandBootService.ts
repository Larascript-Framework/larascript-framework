import ICommandBootService from "@/core/interfaces/ICommandBootService.js";
import { KernelOptions } from "@larascript-framework/bootstrap";
import { app } from "./App.js";

class CommandBootService implements ICommandBootService {
  /**
   * Execute commands
   * @param args
   * @throws CommandNotFoundException
   */
  async boot(args: string[]): Promise<void> {
    await app('console').readerService(args).handle();
  }

  /**
   * Get the kernel options
   * @param args
   * @param options
   * @returns
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getKernelOptions = (args: string[]): KernelOptions => {
    return {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      shouldUseProvider: (provider) => true
    };
  };
}

export default CommandBootService;
