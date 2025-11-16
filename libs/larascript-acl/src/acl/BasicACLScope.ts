export class BasicACLScope {
  /**
   * Returns an object of default scopes that can be used in the system.
   * @returns An object with the following properties:
   * - READ: 'read'
   * - WRITE: 'write'
   * - DELETE: 'delete'
   * - CREATE: 'create'
   * - ALL: 'all'
   */
  public static getDefaultScopes() {
    return {
      READ: "read",
      WRITE: "write",
      DELETE: "delete",
      CREATE: "create",
      ALL: "all",
    } as const;
  }

  /**
   * Checks if the given scopes match exactly with the scopes in the scopesMatch array.
   * @param scopesMatch The array of scopes to check against
   * @param scopesSearch The scopes to search for in the scopesMatch array
   * @returns True if all scopes in scopesSearch are present in scopesMatch, false otherwise
   */
  public static exactMatch(
    scopesMatch: string[] | string,
    scopesSearch: string[] | string,
  ): boolean {
    scopesMatch = typeof scopesMatch === "string" ? [scopesMatch] : scopesMatch;
    scopesSearch =
      typeof scopesSearch === "string" ? [scopesSearch] : scopesSearch;

    for (const scopeSearch of scopesSearch) {
      if (!scopesMatch.includes(scopeSearch)) return false;
    }

    return true;
  }

  /**
   * Checks if any of the given scopes match with the scopes in the scopesMatch array.
   * @param scopesMatch The array of scopes to check against
   * @param scopesSearch The scopes to search for in the scopesMatch array
   * @returns True if any scopes in scopesSearch are present in scopesMatch, false otherwise
   */
  public static partialMatch(
    scopesMatch: string[] | string,
    scopesSearch: string[] | string,
  ): boolean {
    scopesMatch = typeof scopesMatch === "string" ? [scopesMatch] : scopesMatch;
    scopesSearch =
      typeof scopesSearch === "string" ? [scopesSearch] : scopesSearch;

    for (const scopeSearch of scopesSearch) {
      if (scopesMatch.includes(scopeSearch)) return true;
    }

    return false;
  }
}
export default BasicACLScope;
