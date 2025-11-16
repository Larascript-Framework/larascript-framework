import { ModelConstructor, TModelScope } from "../index.js";

/**
 * ModelScopes is a utility class that helps generate standardized scope strings for model-based permissions.
 *
 * The class provides functionality to create scopes in the format of 'modelName:scopeType' where:
 * - modelName: The name of the model class (e.g., 'User', 'BlogPost')
 * - scopeType: The type of permission ('read', 'write', 'create', 'delete', or 'all')
 *
 * This standardized format is used throughout the application for:
 * - API token permissions
 * - Role-based access control
 * - Permission validation
 *
 * The scope format allows for granular control over what actions can be performed on specific models.
 * For example:
 * - 'User:read' allows reading user data
 * - 'BlogPost:write' allows updating blog posts
 * - 'Comment:delete' allows deleting comments
 *
 * The 'all' scope type is a special case that expands to include all basic operations
 * (read, write, create, and delete) for the specified model.
 */

export class ModelScopes {
  /**
   * Generates an array of scope strings for a given model and scope types.
   */
  public static getScopes(
    model: ModelConstructor,
    scopes: TModelScope[] = ["all"],
    additionalScopes: string[] = [],
  ): string[] {
    if (scopes?.includes("all")) {
      scopes = ["read", "write", "delete", "create"];
    }
    return [
      ...scopes.map((scope) => `${model.name}:${scope}`),
      ...additionalScopes,
    ];
  }
}

export default ModelScopes;
