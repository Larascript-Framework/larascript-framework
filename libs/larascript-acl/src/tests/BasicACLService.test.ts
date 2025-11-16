import { beforeEach, describe, expect, test } from "@jest/globals";
import {
  BasicACLException,
  BasicACLService,
  IAccessControlEntity,
  IAclConfig,
  IAclGroup,
} from "../acl/index.js";

// Mock implementation of IAccessControlEntity for testing
class MockAccessControlEntity implements IAccessControlEntity {
  private aclRoles: string[] = [];
  private aclGroups: string[] = [];

  getAclRoles(): string[] | null {
    return this.aclRoles.length > 0 ? [...this.aclRoles] : null;
  }

  setAclRoles(roles: string[]): void {
    this.aclRoles = [...roles];
  }

  getAclGroups(): string[] | null {
    return this.aclGroups.length > 0 ? [...this.aclGroups] : null;
  }

  setAclGroups(groups: string[]): void {
    this.aclGroups = [...groups];
  }
}

describe("BasicACLService", () => {
  let aclService: BasicACLService;
  let mockConfig: IAclConfig;
  let mockEntity: MockAccessControlEntity;

  beforeEach(() => {
    // Setup mock configuration
    mockConfig = {
      defaultGroup: "user",
      groups: [
        {
          name: "admin",
          roles: ["role_admin", "role_moderator"],
        },
        {
          name: "user",
          roles: ["role_user"],
        },
        {
          name: "moderator",
          roles: ["role_moderator"],
        },
      ],
      roles: [
        {
          name: "role_admin",
          scopes: ["read:all", "write:all", "delete:all"],
        },
        {
          name: "role_moderator",
          scopes: ["read:all", "write:limited", "delete:limited"],
        },
        {
          name: "role_user",
          scopes: ["read:own", "write:own"],
        },
      ],
    };

    aclService = new BasicACLService(mockConfig);
    mockEntity = new MockAccessControlEntity();
  });

  describe("Constructor and Configuration", () => {
    test("should initialize with provided config", () => {
      expect(aclService.getConfig()).toBe(mockConfig);
    });

    test("should return the same config instance", () => {
      const config1 = aclService.getConfig();
      const config2 = aclService.getConfig();
      expect(config1).toBe(config2);
    });
  });

  describe("getDefaultGroup", () => {
    test("should return the default group", () => {
      const defaultGroup = aclService.getDefaultGroup();
      expect(defaultGroup.name).toBe("user");
      expect(defaultGroup.roles).toEqual(["role_user"]);
    });
  });

  describe("getGroup", () => {
    test("should return existing group by name", () => {
      const adminGroup = aclService.getGroup("admin");
      expect(adminGroup.name).toBe("admin");
      expect(adminGroup.roles).toEqual(["role_admin", "role_moderator"]);
    });

    test("should throw error for non-existent group", () => {
      expect(() => {
        aclService.getGroup("non-existent");
      }).toThrow(BasicACLException);
    });

    test("should throw BasicACLException with correct message for non-existent group", () => {
      expect(() => {
        aclService.getGroup("non-existent");
      }).toThrow("Group non-existent not found");
    });
  });

  describe("getGroupRoles", () => {
    test("should return roles for group by name", () => {
      const roles = aclService.getGroupRoles("admin");
      expect(roles).toHaveLength(2);
      expect(roles.map((r) => r.name)).toEqual([
        "role_admin",
        "role_moderator",
      ]);
    });

    test("should return roles for group object", () => {
      const adminGroup = aclService.getGroup("admin");
      const roles = aclService.getGroupRoles(adminGroup);
      expect(roles).toHaveLength(2);
      expect(roles.map((r) => r.name)).toEqual([
        "role_admin",
        "role_moderator",
      ]);
    });
  });

  describe("getGroupScopes", () => {
    test("should return all scopes for group by name", () => {
      const scopes = aclService.getGroupScopes("admin");
      expect(scopes).toContain("read:all");
      expect(scopes).toContain("write:all");
      expect(scopes).toContain("delete:all");
      expect(scopes).toContain("write:limited");
      expect(scopes).toContain("delete:limited");
    });

    test("should return scopes for group object", () => {
      const adminGroup = aclService.getGroup("admin");
      const scopes = aclService.getGroupScopes(adminGroup);
      expect(scopes).toContain("read:all");
      expect(scopes).toContain("write:all");
      expect(scopes).toContain("delete:all");
    });
  });

  describe("getRole", () => {
    test("should return existing role by name", () => {
      const adminRole = aclService.getRole("role_admin");
      expect(adminRole.name).toBe("role_admin");
      expect(adminRole.scopes).toEqual(["read:all", "write:all", "delete:all"]);
    });

    test("should throw error for non-existent role", () => {
      expect(() => {
        aclService.getRole("non-existent-role");
      }).toThrow(BasicACLException);
    });

    test("should throw BasicACLException with correct message for non-existent role", () => {
      expect(() => {
        aclService.getRole("non-existent-role");
      }).toThrow("Role non-existent-role not found");
    });
  });

  describe("getRoleScopes", () => {
    test("should return scopes for single role", () => {
      const scopes = aclService.getRoleScopes("role_admin");
      expect(scopes).toEqual(["read:all", "write:all", "delete:all"]);
    });

    test("should return combined scopes for multiple roles", () => {
      const scopes = aclService.getRoleScopes(["role_admin", "role_user"]);
      expect(scopes).toContain("read:all");
      expect(scopes).toContain("write:all");
      expect(scopes).toContain("delete:all");
      expect(scopes).toContain("read:own");
      expect(scopes).toContain("write:own");
    });
  });

  describe("getRoleScopesFromUser", () => {
    test("should return scopes from user roles", async () => {
      await aclService.assignRoleToUser(mockEntity, [
        "role_admin",
        "role_user",
      ]);
      const scopes = aclService.getRoleScopesFromUser(mockEntity);

      expect(scopes).toContain("read:all");
      expect(scopes).toContain("write:all");
      expect(scopes).toContain("delete:all");
      expect(scopes).toContain("read:own");
      expect(scopes).toContain("write:own");
    });

    test("should return empty array when user has no roles", () => {
      const scopes = aclService.getRoleScopesFromUser(mockEntity);
      expect(scopes).toEqual([]);
    });

    test("should return empty array when user roles is null", () => {
      mockEntity.setAclRoles([]);
      const scopes = aclService.getRoleScopesFromUser(mockEntity);
      expect(scopes).toEqual([]);
    });
  });

  describe("assignRoleToUser", () => {
    test("should assign single role to user", async () => {
      await aclService.assignRoleToUser(mockEntity, "role_admin");
      expect(mockEntity.getAclRoles()).toEqual(["role_admin"]);
    });

    test("should assign multiple roles to user", async () => {
      await aclService.assignRoleToUser(mockEntity, [
        "role_admin",
        "role_user",
      ]);
      expect(mockEntity.getAclRoles()).toEqual(["role_admin", "role_user"]);
    });

    test("should overwrite existing roles", async () => {
      await aclService.assignRoleToUser(mockEntity, "role_admin");
      await aclService.assignRoleToUser(mockEntity, "role_user");
      expect(mockEntity.getAclRoles()).toEqual(["role_user"]);
    });
  });

  describe("appendRoleToUser", () => {
    test("should append role to existing roles", async () => {
      await aclService.assignRoleToUser(mockEntity, "role_admin");
      await aclService.appendRoleToUser(mockEntity, "role_user");
      expect(mockEntity.getAclRoles()).toEqual(["role_admin", "role_user"]);
    });

    test("should append role when user has no roles", async () => {
      await aclService.appendRoleToUser(mockEntity, "role_admin");
      expect(mockEntity.getAclRoles()).toEqual(["role_admin"]);
    });
  });

  describe("assignGroupToUser", () => {
    test("should assign single group to user", async () => {
      await aclService.assignGroupToUser(mockEntity, "admin");
      expect(mockEntity.getAclGroups()).toEqual(["admin"]);
    });

    test("should assign multiple groups to user", async () => {
      await aclService.assignGroupToUser(mockEntity, ["admin", "user"]);
      expect(mockEntity.getAclGroups()).toEqual(["admin", "user"]);
    });

    test("should overwrite existing groups", async () => {
      await aclService.assignGroupToUser(mockEntity, "admin");
      await aclService.assignGroupToUser(mockEntity, "user");
      expect(mockEntity.getAclGroups()).toEqual(["user"]);
    });
  });

  describe("appendGroupToUser", () => {
    test("should append group to existing groups", async () => {
      await aclService.assignGroupToUser(mockEntity, "admin");
      await aclService.appendGroupToUser(mockEntity, "user");
      expect(mockEntity.getAclGroups()).toEqual(["admin", "user"]);
    });

    test("should append group when user has no groups", async () => {
      await aclService.appendGroupToUser(mockEntity, "admin");
      expect(mockEntity.getAclGroups()).toEqual(["admin"]);
    });
  });

  describe("removeRoleFromUser", () => {
    test("should remove single role from user", async () => {
      await aclService.assignRoleToUser(mockEntity, [
        "role_admin",
        "role_user",
      ]);
      await aclService.removeRoleFromUser(mockEntity, "role_admin");
      expect(mockEntity.getAclRoles()).toEqual(["role_user"]);
    });

    test("should remove multiple roles from user", async () => {
      await aclService.assignRoleToUser(mockEntity, [
        "role_admin",
        "role_user",
        "role_moderator",
      ]);
      await aclService.removeRoleFromUser(mockEntity, [
        "role_admin",
        "role_user",
      ]);
      expect(mockEntity.getAclRoles()).toEqual(["role_moderator"]);
    });

    test("should handle removing non-existent role", async () => {
      await aclService.assignRoleToUser(mockEntity, "role_admin");
      await aclService.removeRoleFromUser(mockEntity, "non-existent-role");
      expect(mockEntity.getAclRoles()).toEqual(["role_admin"]);
    });

    test("should handle removing from user with no roles", async () => {
      await aclService.removeRoleFromUser(mockEntity, "role_admin");
      expect(mockEntity.getAclRoles()).toBeNull();
    });
  });

  describe("removeGroupFromUser", () => {
    test("should remove single group from user", async () => {
      await aclService.assignGroupToUser(mockEntity, ["admin", "user"]);
      await aclService.removeGroupFromUser(mockEntity, "admin");
      expect(mockEntity.getAclGroups()).toEqual(["user"]);
    });

    test("should remove multiple groups from user", async () => {
      await aclService.assignGroupToUser(mockEntity, [
        "admin",
        "user",
        "moderator",
      ]);
      await aclService.removeGroupFromUser(mockEntity, ["admin", "user"]);
      expect(mockEntity.getAclGroups()).toEqual(["moderator"]);
    });

    test("should handle removing non-existent group", async () => {
      await aclService.assignGroupToUser(mockEntity, "admin");
      await aclService.removeGroupFromUser(mockEntity, "non-existent-group");
      expect(mockEntity.getAclGroups()).toEqual(["admin"]);
    });

    test("should handle removing from user with no groups", async () => {
      await aclService.removeGroupFromUser(mockEntity, "admin");
      expect(mockEntity.getAclGroups()).toBeNull();
    });
  });

  describe("hasScope", () => {
    test("should return true when user has the scope", async () => {
      await aclService.assignRoleToUser(mockEntity, "role_admin");
      const hasScope = aclService.hasScope(mockEntity, "read:all");
      expect(hasScope).toBe(true);
    });

    test("should return false when user does not have the scope", async () => {
      await aclService.assignRoleToUser(mockEntity, "role_user");
      const hasScope = aclService.hasScope(mockEntity, "delete:all");
      expect(hasScope).toBe(false);
    });

    test("should return false when user has no roles", () => {
      const hasScope = aclService.hasScope(mockEntity, "read:all");
      expect(hasScope).toBe(false);
    });

    test("should return true for exact scope match", async () => {
      await aclService.assignRoleToUser(mockEntity, "role_admin");
      const hasScope = aclService.hasScope(mockEntity, "read:all");
      expect(hasScope).toBe(true);
    });

    test("should return false for non-existent scope", async () => {
      await aclService.assignRoleToUser(mockEntity, "role_admin");
      const hasScope = aclService.hasScope(mockEntity, "non:existent");
      expect(hasScope).toBe(false);
    });

    test("should return false for partial scope match", async () => {
      await aclService.assignRoleToUser(mockEntity, "role_admin");
      const hasScope = aclService.hasScope(mockEntity, "read");
      expect(hasScope).toBe(false);
    });

    test("should throw error when user has non-existent role", async () => {
      await aclService.assignRoleToUser(mockEntity, "non-existent-role");
      expect(() => {
        aclService.hasScope(mockEntity, "read:all");
      }).toThrow(BasicACLException);
    });

    test("should throw BasicACLException with correct message when user has non-existent role", async () => {
      await aclService.assignRoleToUser(mockEntity, "non-existent-role");
      expect(() => {
        aclService.hasScope(mockEntity, "read:all");
      }).toThrow("Role non-existent-role not found");
    });
  });

  describe("hasScopes", () => {
    test("should return true when user has all scopes", async () => {
      await aclService.assignRoleToUser(mockEntity, "role_admin");
      const hasScopes = aclService.hasScopes(mockEntity, [
        "read:all",
        "write:all",
      ]);
      expect(hasScopes).toBe(true);
    });

    test("should return false when user is missing any scope", async () => {
      await aclService.assignRoleToUser(mockEntity, "role_user");
      const hasScopes = aclService.hasScopes(mockEntity, [
        "read:own",
        "delete:all",
      ]);
      expect(hasScopes).toBe(false);
    });

    test("should return false when user has no roles", () => {
      const hasScopes = aclService.hasScopes(mockEntity, ["read:all"]);
      expect(hasScopes).toBe(false);
    });

    test("should return true for empty scopes array", () => {
      const hasScopes = aclService.hasScopes(mockEntity, []);
      expect(hasScopes).toBe(true);
    });

    test("should return true when user has multiple roles covering all scopes", async () => {
      await aclService.assignRoleToUser(mockEntity, [
        "role_admin",
        "role_user",
      ]);
      const hasScopes = aclService.hasScopes(mockEntity, [
        "read:all",
        "write:own",
      ]);
      expect(hasScopes).toBe(true);
    });
  });

  describe("hasRole", () => {
    test("should return true when user has the role", async () => {
      await aclService.assignRoleToUser(mockEntity, "role_admin");
      const hasRole = aclService.hasRole(mockEntity, "role_admin");
      expect(hasRole).toBe(true);
    });

    test("should return false when user does not have the role", async () => {
      await aclService.assignRoleToUser(mockEntity, "role_user");
      const hasRole = aclService.hasRole(mockEntity, "role_admin");
      expect(hasRole).toBe(false);
    });

    test("should return false when user has no roles", () => {
      const hasRole = aclService.hasRole(mockEntity, "role_admin");
      expect(hasRole).toBe(false);
    });

    test("should return true when user has all specified roles", async () => {
      await aclService.assignRoleToUser(mockEntity, [
        "role_admin",
        "role_user",
      ]);
      const hasRole = aclService.hasRole(mockEntity, [
        "role_admin",
        "role_user",
      ]);
      expect(hasRole).toBe(true);
    });

    test("should return false when user is missing any of the specified roles", async () => {
      await aclService.assignRoleToUser(mockEntity, ["role_admin"]);
      const hasRole = aclService.hasRole(mockEntity, [
        "role_admin",
        "role_user",
      ]);
      expect(hasRole).toBe(false);
    });

    test("should return true for empty roles array", () => {
      const hasRole = aclService.hasRole(mockEntity, []);
      expect(hasRole).toBe(true);
    });

    test("should handle single string role parameter", async () => {
      await aclService.assignRoleToUser(mockEntity, "role_admin");
      const hasRole = aclService.hasRole(mockEntity, "role_admin");
      expect(hasRole).toBe(true);
    });

    test("should handle array of roles parameter", async () => {
      await aclService.assignRoleToUser(mockEntity, [
        "role_admin",
        "role_user",
      ]);
      const hasRole = aclService.hasRole(mockEntity, [
        "role_admin",
        "role_user",
      ]);
      expect(hasRole).toBe(true);
    });

    test("should return false for non-existent role check", async () => {
      await aclService.assignRoleToUser(mockEntity, "role_admin");
      const hasRole = aclService.hasRole(mockEntity, "non-existent-role");
      expect(hasRole).toBe(false);
    });

    test("should return false when checking multiple roles and user has none", () => {
      const hasRole = aclService.hasRole(mockEntity, [
        "role_admin",
        "role_user",
      ]);
      expect(hasRole).toBe(false);
    });

    test("should return true when user has more roles than required", async () => {
      await aclService.assignRoleToUser(mockEntity, [
        "role_admin",
        "role_user",
        "role_moderator",
      ]);
      const hasRole = aclService.hasRole(mockEntity, [
        "role_admin",
        "role_user",
      ]);
      expect(hasRole).toBe(true);
    });
  });

  describe("hasGroup", () => {
    test("should return true when user has the group", async () => {
      await aclService.assignGroupToUser(mockEntity, "admin");
      const hasGroup = aclService.hasGroup(mockEntity, "admin");
      expect(hasGroup).toBe(true);
    });

    test("should return false when user does not have the group", async () => {
      await aclService.assignGroupToUser(mockEntity, "user");
      const hasGroup = aclService.hasGroup(mockEntity, "admin");
      expect(hasGroup).toBe(false);
    });

    test("should return false when user has no groups", () => {
      const hasGroup = aclService.hasGroup(mockEntity, "admin");
      expect(hasGroup).toBe(false);
    });

    test("should return true when user has all specified groups", async () => {
      await aclService.assignGroupToUser(mockEntity, ["admin", "user"]);
      const hasGroup = aclService.hasGroup(mockEntity, ["admin", "user"]);
      expect(hasGroup).toBe(true);
    });

    test("should return false when user is missing any of the specified groups", async () => {
      await aclService.assignGroupToUser(mockEntity, ["admin"]);
      const hasGroup = aclService.hasGroup(mockEntity, ["admin", "user"]);
      expect(hasGroup).toBe(false);
    });

    test("should return true for empty groups array", () => {
      const hasGroup = aclService.hasGroup(mockEntity, []);
      expect(hasGroup).toBe(true);
    });

    test("should handle single string group parameter", async () => {
      await aclService.assignGroupToUser(mockEntity, "admin");
      const hasGroup = aclService.hasGroup(mockEntity, "admin");
      expect(hasGroup).toBe(true);
    });

    test("should handle array of groups parameter", async () => {
      await aclService.assignGroupToUser(mockEntity, ["admin", "user"]);
      const hasGroup = aclService.hasGroup(mockEntity, ["admin", "user"]);
      expect(hasGroup).toBe(true);
    });
  });

  describe("Edge Cases and Error Handling", () => {
    test("should handle empty roles array in getRoleScopes", () => {
      const scopes = aclService.getRoleScopes([]);
      expect(scopes).toEqual([]);
    });

    test("should handle empty groups array in getGroupRoles", () => {
      const emptyGroup: IAclGroup = { name: "empty", roles: [] };
      const roles = aclService.getGroupRoles(emptyGroup);
      expect(roles).toEqual([]);
    });

    test("should handle user with null roles", () => {
      mockEntity.setAclRoles([]);
      const scopes = aclService.getRoleScopesFromUser(mockEntity);
      expect(scopes).toEqual([]);
    });

    test("should handle user with null groups", async () => {
      mockEntity.setAclGroups([]);
      await aclService.appendGroupToUser(mockEntity, "admin");
      expect(mockEntity.getAclGroups()).toEqual(["admin"]);
    });
  });

  describe("Integration Tests", () => {
    test("should handle complex role and group management", async () => {
      // Assign initial roles and groups
      await aclService.assignRoleToUser(mockEntity, [
        "role_admin",
        "role_user",
      ]);
      await aclService.assignGroupToUser(mockEntity, ["admin", "user"]);

      // Verify initial state
      expect(mockEntity.getAclRoles()).toEqual(["role_admin", "role_user"]);
      expect(mockEntity.getAclGroups()).toEqual(["admin", "user"]);

      // Get scopes from user roles
      const scopes = aclService.getRoleScopesFromUser(mockEntity);
      expect(scopes).toContain("read:all");
      expect(scopes).toContain("write:all");
      expect(scopes).toContain("delete:all");
      expect(scopes).toContain("read:own");
      expect(scopes).toContain("write:own");

      // Remove some roles and groups
      await aclService.removeRoleFromUser(mockEntity, "role_admin");
      await aclService.removeGroupFromUser(mockEntity, "admin");

      // Verify final state
      expect(mockEntity.getAclRoles()).toEqual(["role_user"]);
      expect(mockEntity.getAclGroups()).toEqual(["user"]);

      // Verify updated scopes
      const updatedScopes = aclService.getRoleScopesFromUser(mockEntity);
      expect(updatedScopes).toEqual(["read:own", "write:own"]);
    });
  });
});
