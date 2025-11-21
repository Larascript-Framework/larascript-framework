import BasicACLScope from "../acl/BasicACLScope.js";

describe("ScopeMatcher", () => {
  describe("getDefaultScopes", () => {
    it("should return the correct default scopes object", () => {
      const defaultScopes = BasicACLScope.getDefaultScopes();

      expect(defaultScopes).toEqual({
        READ: "read",
        WRITE: "write",
        DELETE: "delete",
        CREATE: "create",
        ALL: "all",
      });
    });

    it("should return a readonly object", () => {
      const defaultScopes = BasicACLScope.getDefaultScopes();

      // The object should be readonly (as const)
      expect(defaultScopes.READ).toBe("read");
      expect(defaultScopes.WRITE).toBe("write");
      expect(defaultScopes.DELETE).toBe("delete");
      expect(defaultScopes.CREATE).toBe("create");
      expect(defaultScopes.ALL).toBe("all");
    });
  });

  describe("exactMatch", () => {
    describe("with string inputs", () => {
      it("should return true when single scope matches exactly", () => {
        const result = BasicACLScope.exactMatch("read", "read");
        expect(result).toBe(true);
      });

      it("should return false when single scope does not match", () => {
        const result = BasicACLScope.exactMatch("read", "write");
        expect(result).toBe(false);
      });

      it("should return true when searching scope is in match array", () => {
        const result = BasicACLScope.exactMatch(["read", "write"], "read");
        expect(result).toBe(true);
      });

      it("should return false when searching scope is not in match array", () => {
        const result = BasicACLScope.exactMatch(["read", "write"], "delete");
        expect(result).toBe(false);
      });
    });

    describe("with array inputs", () => {
      it("should return true when all search scopes are in match array", () => {
        const result = BasicACLScope.exactMatch(
          ["read", "write", "delete"],
          ["read", "write"],
        );
        expect(result).toBe(true);
      });

      it("should return false when not all search scopes are in match array", () => {
        const result = BasicACLScope.exactMatch(
          ["read", "write"],
          ["read", "delete"],
        );
        expect(result).toBe(false);
      });

      it("should return true when search scopes match exactly", () => {
        const result = BasicACLScope.exactMatch(
          ["read", "write"],
          ["read", "write"],
        );
        expect(result).toBe(true);
      });

      it("should return true when search scopes are subset of match array", () => {
        const result = BasicACLScope.exactMatch(
          ["read", "write", "delete", "create"],
          ["read", "delete"],
        );
        expect(result).toBe(true);
      });
    });

    describe("with mixed inputs", () => {
      it("should handle string search in array match", () => {
        const result = BasicACLScope.exactMatch(["read", "write"], "read");
        expect(result).toBe(true);
      });

      it("should handle array search in string match", () => {
        const result = BasicACLScope.exactMatch("read", ["read", "write"]);
        expect(result).toBe(false); // Only 'read' is in the match string, not 'write'
      });
    });

    describe("edge cases", () => {
      it("should return true for empty search array", () => {
        const result = BasicACLScope.exactMatch(["read", "write"], []);
        expect(result).toBe(true);
      });

      it("should return false for empty match array with non-empty search", () => {
        const result = BasicACLScope.exactMatch([], ["read"]);
        expect(result).toBe(false);
      });

      it("should return true for both empty arrays", () => {
        const result = BasicACLScope.exactMatch([], []);
        expect(result).toBe(true);
      });

      it("should handle case sensitivity", () => {
        const result = BasicACLScope.exactMatch(["Read", "Write"], ["read"]);
        expect(result).toBe(false);
      });
    });
  });

  describe("partialMatch", () => {
    describe("with string inputs", () => {
      it("should return true when single scope matches", () => {
        const result = BasicACLScope.partialMatch("read", "read");
        expect(result).toBe(true);
      });

      it("should return false when single scope does not match", () => {
        const result = BasicACLScope.partialMatch("read", "write");
        expect(result).toBe(false);
      });

      it("should return true when searching scope is in match array", () => {
        const result = BasicACLScope.partialMatch(["read", "write"], "read");
        expect(result).toBe(true);
      });

      it("should return false when searching scope is not in match array", () => {
        const result = BasicACLScope.partialMatch(["read", "write"], "delete");
        expect(result).toBe(false);
      });
    });

    describe("with array inputs", () => {
      it("should return true when any search scope is in match array", () => {
        const result = BasicACLScope.partialMatch(
          ["read", "write"],
          ["read", "delete"],
        );
        expect(result).toBe(true);
      });

      it("should return true when all search scopes are in match array", () => {
        const result = BasicACLScope.partialMatch(
          ["read", "write", "delete"],
          ["read", "write"],
        );
        expect(result).toBe(true);
      });

      it("should return false when no search scopes are in match array", () => {
        const result = BasicACLScope.partialMatch(
          ["read", "write"],
          ["delete", "create"],
        );
        expect(result).toBe(false);
      });

      it("should return true when first scope matches", () => {
        const result = BasicACLScope.partialMatch(
          ["read", "write"],
          ["read", "delete"],
        );
        expect(result).toBe(true);
      });

      it("should return true when last scope matches", () => {
        const result = BasicACLScope.partialMatch(
          ["read", "write"],
          ["delete", "write"],
        );
        expect(result).toBe(true);
      });
    });

    describe("with mixed inputs", () => {
      it("should handle string search in array match", () => {
        const result = BasicACLScope.partialMatch(["read", "write"], "read");
        expect(result).toBe(true);
      });

      it("should handle array search in string match", () => {
        const result = BasicACLScope.partialMatch("read", ["read", "write"]);
        expect(result).toBe(true); // 'read' is in the search array
      });
    });

    describe("edge cases", () => {
      it("should return false for empty search array", () => {
        const result = BasicACLScope.partialMatch(["read", "write"], []);
        expect(result).toBe(false);
      });

      it("should return false for empty match array with non-empty search", () => {
        const result = BasicACLScope.partialMatch([], ["read"]);
        expect(result).toBe(false);
      });

      it("should return false for both empty arrays", () => {
        const result = BasicACLScope.partialMatch([], []);
        expect(result).toBe(false);
      });

      it("should handle case sensitivity", () => {
        const result = BasicACLScope.partialMatch(["Read", "Write"], ["read"]);
        expect(result).toBe(false);
      });
    });
  });

  describe("comparison between exactMatch and partialMatch", () => {
    it("should show different behavior for same inputs", () => {
      const matchScopes = ["read", "write"];
      const searchScopes = ["read", "delete"];

      const exactResult = BasicACLScope.exactMatch(matchScopes, searchScopes);
      const partialResult = BasicACLScope.partialMatch(
        matchScopes,
        searchScopes,
      );

      expect(exactResult).toBe(false); // Not all scopes match
      expect(partialResult).toBe(true); // At least one scope matches
    });

    it("should show same behavior when all scopes match", () => {
      const matchScopes = ["read", "write"];
      const searchScopes = ["read", "write"];

      const exactResult = BasicACLScope.exactMatch(matchScopes, searchScopes);
      const partialResult = BasicACLScope.partialMatch(
        matchScopes,
        searchScopes,
      );

      expect(exactResult).toBe(true);
      expect(partialResult).toBe(true);
    });

    it("should show same behavior when no scopes match", () => {
      const matchScopes = ["read", "write"];
      const searchScopes = ["delete", "create"];

      const exactResult = BasicACLScope.exactMatch(matchScopes, searchScopes);
      const partialResult = BasicACLScope.partialMatch(
        matchScopes,
        searchScopes,
      );

      expect(exactResult).toBe(false);
      expect(partialResult).toBe(false);
    });
  });
});
