import { IAclConfig } from "@/acl/index.js";
import { ComposableACL } from "../acl/ComposableACL.js";
import { compose } from "../utils/compose.js";

// Test ACL configuration
const testAclConfig: IAclConfig = {
  defaultGroup: "User",
  groups: [
    {
      name: "Admin",
      roles: ["role_admin"],
    },
    {
      name: "User",
      roles: ["role_user"],
    },
    {
      name: "Moderator",
      roles: ["role_moderator"],
    },
  ],
  roles: [
    {
      name: "role_admin",
      scopes: ["admin:read", "admin:write", "user:read", "user:write"],
    },
    {
      name: "role_user",
      scopes: ["user:read", "user:write"],
    },
    {
      name: "role_moderator",
      scopes: ["user:read", "moderator:read", "moderator:write"],
    },
  ],
};

// Base class for testing
class BaseTestClass {
  constructor(public name: string) {}
}

// Test class with ACL functionality
class TestClassWithACL extends compose(
  BaseTestClass,
  ComposableACL(testAclConfig),
) {
  constructor(name: string) {
    super(name);
  }
}

describe("ComposableACL", () => {
  let testInstance: TestClassWithACL;

  beforeEach(() => {
    testInstance = new TestClassWithACL("Test User");
  });

  describe("Role Management", () => {
    it("should assign roles to user", async () => {
      await testInstance.assignRoleToUser("role_user");
      expect(testInstance.hasRole("role_user")).toBe(true);
    });

    it("should append roles to user", async () => {
      await testInstance.assignRoleToUser("role_user");
      await testInstance.appendRoleToUser("role_moderator");

      expect(testInstance.hasRole("role_user")).toBe(true);
      expect(testInstance.hasRole("role_moderator")).toBe(true);
      expect(testInstance.hasRole(["role_user", "role_moderator"])).toBe(true);
    });

    it("should remove roles from user", async () => {
      await testInstance.assignRoleToUser(["role_user", "role_moderator"]);
      await testInstance.removeRoleFromUser("role_user");

      expect(testInstance.hasRole("role_user")).toBe(false);
      expect(testInstance.hasRole("role_moderator")).toBe(true);
    });
  });

  describe("Scope Management", () => {
    it("should check if user has specific scope", async () => {
      await testInstance.assignRoleToUser("role_user");
      expect(testInstance.hasScope("user:read")).toBe(true);
      expect(testInstance.hasScope("admin:write")).toBe(false);
    });

    it("should check if user has multiple scopes", async () => {
      await testInstance.assignRoleToUser("role_user");
      expect(testInstance.hasScopes(["user:read", "user:write"])).toBe(true);
      expect(testInstance.hasScopes(["user:read", "admin:write"])).toBe(false);
    });

    it("should get all scopes from user roles", async () => {
      await testInstance.assignRoleToUser(["role_user", "role_moderator"]);
      const scopes = testInstance.getRoleScopesFromUser();

      expect(scopes).toContain("user:read");
      expect(scopes).toContain("user:write");
      expect(scopes).toContain("moderator:read");
      expect(scopes).toContain("moderator:write");
    });
  });

  describe("Group Management", () => {
    it("should assign groups to user", async () => {
      await testInstance.assignGroupToUser("Admin");
      expect(testInstance.hasGroup("Admin")).toBe(true);
    });

    it("should append groups to user", async () => {
      await testInstance.assignGroupToUser("User");
      await testInstance.appendGroupToUser("Moderator");

      expect(testInstance.hasGroup("User")).toBe(true);
      expect(testInstance.hasGroup("Moderator")).toBe(true);
    });

    it("should remove groups from user", async () => {
      await testInstance.assignGroupToUser(["User", "Moderator"]);
      await testInstance.removeGroupFromUser("User");

      expect(testInstance.hasGroup("User")).toBe(false);
      expect(testInstance.hasGroup("Moderator")).toBe(true);
    });
  });

  describe("Configuration Access", () => {
    it("should provide access to ACL config", () => {
      const config = testInstance.getConfig();
      expect(config.defaultGroup).toBe("User");
      expect(config.groups).toHaveLength(3);
      expect(config.roles).toHaveLength(3);
    });

    it("should get default group", () => {
      const defaultGroup = testInstance.getDefaultGroup();
      expect(defaultGroup.name).toBe("User");
    });

    it("should get specific group", () => {
      const adminGroup = testInstance.getGroup("Admin");
      expect(adminGroup.name).toBe("Admin");
      expect(adminGroup.roles).toContain("role_admin");
    });

    it("should get specific role", () => {
      const adminRole = testInstance.getRole("role_admin");
      expect(adminRole.name).toBe("role_admin");
      expect(adminRole.scopes).toContain("admin:read");
    });
  });

  describe("Error Handling", () => {
    it("should throw error for non-existent role", () => {
      expect(() => testInstance.getRole("non_existent_role")).toThrow(
        "Role non_existent_role not found",
      );
    });

    it("should throw error for non-existent group", () => {
      expect(() => testInstance.getGroup("non_existent_group")).toThrow(
        "Group non_existent_group not found",
      );
    });
  });

  describe("Integration with Base Class", () => {
    it("should preserve base class functionality", () => {
      expect(testInstance.name).toBe("Test User");
      expect(testInstance).toBeInstanceOf(BaseTestClass);
    });

    it("should be instance of composed class", () => {
      expect(testInstance).toBeInstanceOf(TestClassWithACL);
    });
  });
});
