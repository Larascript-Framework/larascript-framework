import { Containers, DependencyLoader } from "@larascript-framework/contracts/larascript-core";
import { UninitializedContainerError } from "../exceptions/index.js";

/**
 * Utility class for creating dependency loader functions from plain objects.
 *
 * This class provides a static method to convert a plain object of dependencies
 * into a type-safe dependency loader function that can be used for dependency
 * injection and management within the Larascript framework.
 *
 * The created loader function allows safe retrieval of dependencies by name,
 * with proper TypeScript type inference and error handling for missing dependencies.
 *
 * @example
 * ```typescript
 * const dependencies = {
 *   'database': new DatabaseService(),
 *   'logger': new LoggerService(),
 *   'config': { port: 3000, host: 'localhost' }
 * };
 *
 * const loader = CreateDependencyLoader.create(dependencies);
 * const database = loader<typeof dependencies, "database">("database");
 * const logger = loader<typeof dependencies, "logger">("logger");
 * ```
 *
 * @since 1.0.0
 */
export class CreateDependencyLoader {
  /**
   * Creates a type-safe dependency loader function from a plain object of dependencies.
   *
   * This method takes a record of dependencies where keys are dependency names
   * and values are the actual dependency instances or configurations. It returns
   * a function that can safely retrieve dependencies by name with full TypeScript
   * type safety and proper error handling.
   *
   * The returned loader function:
   * - Provides type-safe access to dependencies
   * - Throws an {@link UninitializedContainerError} if a dependency is not found
   * - Supports generic type parameters for enhanced type inference
   *
   * @param dependencies - A record object containing dependency names as keys and their corresponding values
   * @returns A {@link DependencyLoader} function that can retrieve dependencies by name with type safety
   *
   * @example
   * ```typescript
   * const deps = {
   *   'userService': new UserService(),
   *   'emailService': new EmailService(),
   *   'config': { apiKey: 'abc123' }
   * };
   *
   * const loader = CreateDependencyLoader.create(deps);
   *
   * // Type-safe dependency retrieval
   * const userService = loader<typeof deps, "userService">("userService");
   * const emailService = loader<typeof deps, "emailService">("emailService");
   *
   * // This would throw UninitializedContainerError
   * // const missing = loader("missingService");
   * ```
   *
   * @throws {UninitializedContainerError} When attempting to access a dependency that doesn't exist
   *
   * @since 1.0.0
   */
  public static create(
    dependencies: Record<string, unknown>,
  ): DependencyLoader<Containers> {
    return <T extends Containers, K extends keyof T>(name: K): T[K] => {
      if (dependencies?.[name as keyof Record<string, unknown>]) {
        return dependencies[name as keyof Record<string, unknown>] as T[K];
      }
      throw new UninitializedContainerError(name as string);
    };
  }
}
