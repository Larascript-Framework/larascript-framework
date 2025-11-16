import { KernelOptions } from "@/core/kernel.js";

 
/**
 * Interface for a service that can boot the console interface
 */
interface ICommandBootService {
  /**
   * Get the kernel options based on the args and options
   * @param args The arguments passed from the command line
   * @param options The options passed to the kernel
   * @returns The kernel options
   */
  getKernelOptions(args: string[], options: KernelOptions): KernelOptions;

  /**
   * Boot the kernel
   * @param args The arguments passed from the command line
   * @returns A promise that resolves when the kernel is booted
   */
  boot(args: string[]): Promise<void>;
}

export default ICommandBootService;
