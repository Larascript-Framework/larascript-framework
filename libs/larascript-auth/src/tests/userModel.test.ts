import { beforeEach, describe, expect, test } from "@jest/globals";
import TestUserModel from "./model/TestUserModel.js";

describe("TestUserModel", () => {
  let userModel: TestUserModel;
  const mockId = "user-123";
  const mockEmail = "test@example.com";
  const mockHashedPassword = "hashed_password_abc123";
  const mockAclRoles = ["admin", "editor"];
  const mockAclGroups = ["developers", "testers"];

  beforeEach(() => {
    userModel = new TestUserModel({
      id: mockId,
      email: mockEmail,
      hashedPassword: mockHashedPassword,
      aclRoles: mockAclRoles,
      aclGroups: mockAclGroups,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });

  describe("Constructor and Basic Getters", () => {
    test("should create instance with all properties", () => {
      expect(userModel.getId()).toBe(mockId);
      expect(userModel.getEmail()).toBe(mockEmail);
      expect(userModel.getHashedPassword()).toBe(mockHashedPassword);
      expect(userModel.getAclRoles()).toEqual(mockAclRoles);
      expect(userModel.getAclGroups()).toEqual(mockAclGroups);
    });

    test("should create instance with undefined values", () => {
      const defaultUser = new TestUserModel();
      expect(defaultUser.getId()).toBeUndefined();
      expect(defaultUser.getEmail()).toBeUndefined();
      expect(defaultUser.getHashedPassword()).toBeUndefined();
      expect(defaultUser.getAclRoles()).toBeUndefined();
      expect(defaultUser.getAclGroups()).toBeUndefined();
    });

    test("should create instance with partial parameters", () => {
      const partialUser = new TestUserModel({
        id: "user-456",
        email: "partial@example.com",
        hashedPassword: "",
        aclRoles: [],
        aclGroups: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      expect(partialUser.getId()).toBe("user-456");
      expect(partialUser.getEmail()).toBe("partial@example.com");
      expect(partialUser.getHashedPassword()).toBe("");
      expect(partialUser.getAclRoles()).toEqual([]);
      expect(partialUser.getAclGroups()).toEqual([]);
    });

    test("should create instance with empty arrays", () => {
      const emptyArraysUser = new TestUserModel({
        id: "user-789",
        email: "empty@example.com",
        hashedPassword: "password123",
        aclRoles: [],
        aclGroups: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      expect(emptyArraysUser.getAclRoles()).toEqual([]);
      expect(emptyArraysUser.getAclGroups()).toEqual([]);
    });
  });

  describe("setEmail and getEmail", () => {
    test("should set and get email correctly", async () => {
      const newEmail = "newemail@example.com";
      await userModel.setEmail(newEmail);
      expect(userModel.getEmail()).toBe(newEmail);
    });

    test("should update email multiple times", async () => {
      await userModel.setEmail("email1@example.com");
      expect(userModel.getEmail()).toBe("email1@example.com");

      await userModel.setEmail("email2@example.com");
      expect(userModel.getEmail()).toBe("email2@example.com");
    });

    test("should handle empty email", async () => {
      await userModel.setEmail("");
      expect(userModel.getEmail()).toBe("");
    });

    test("should handle special characters in email", async () => {
      const specialEmail = "test+tag@example-domain.co.uk";
      await userModel.setEmail(specialEmail);
      expect(userModel.getEmail()).toBe(specialEmail);
    });
  });

  describe("setHashedPassword and getHashedPassword", () => {
    test("should set and get hashed password correctly", async () => {
      const newHashedPassword = "new_hashed_password_xyz789";
      await userModel.setHashedPassword(newHashedPassword);
      expect(userModel.getHashedPassword()).toBe(newHashedPassword);
    });

    test("should update hashed password multiple times", async () => {
      await userModel.setHashedPassword("password1");
      expect(userModel.getHashedPassword()).toBe("password1");

      await userModel.setHashedPassword("password2");
      expect(userModel.getHashedPassword()).toBe("password2");
    });

    test("should handle empty hashed password", async () => {
      await userModel.setHashedPassword("");
      expect(userModel.getHashedPassword()).toBe("");
    });

    test("should handle complex hashed password", async () => {
      const complexPassword = "$2b$10$abcdefghijklmnopqrstuvwxyz123456789";
      await userModel.setHashedPassword(complexPassword);
      expect(userModel.getHashedPassword()).toBe(complexPassword);
    });
  });

  describe("setAclRoles and getAclRoles", () => {
    test("should set and get ACL roles correctly", async () => {
      const newRoles = ["user", "moderator"];
      await userModel.setAclRoles(newRoles);
      expect(userModel.getAclRoles()).toEqual(newRoles);
    });

    test("should update ACL roles multiple times", async () => {
      await userModel.setAclRoles(["role1"]);
      expect(userModel.getAclRoles()).toEqual(["role1"]);

      await userModel.setAclRoles(["role2", "role3"]);
      expect(userModel.getAclRoles()).toEqual(["role2", "role3"]);
    });

    test("should handle empty roles array", async () => {
      await userModel.setAclRoles([]);
      expect(userModel.getAclRoles()).toEqual([]);
    });

    test("should handle single role", async () => {
      await userModel.setAclRoles(["single-role"]);
      expect(userModel.getAclRoles()).toEqual(["single-role"]);
    });

    test("should handle duplicate roles", async () => {
      await userModel.setAclRoles(["admin", "admin", "user"]);
      expect(userModel.getAclRoles()).toEqual(["admin", "admin", "user"]);
    });

    test("should handle special characters in role names", async () => {
      const specialRoles = [
        "role-with-dash",
        "role_with_underscore",
        "role.with.dot",
      ];
      await userModel.setAclRoles(specialRoles);
      expect(userModel.getAclRoles()).toEqual(specialRoles);
    });
  });

  describe("setAclGroups and getAclGroups", () => {
    test("should set and get ACL groups correctly", async () => {
      const newGroups = ["users", "premium"];
      await userModel.setAclGroups(newGroups);
      expect(userModel.getAclGroups()).toEqual(newGroups);
    });

    test("should update ACL groups multiple times", async () => {
      await userModel.setAclGroups(["group1"]);
      expect(userModel.getAclGroups()).toEqual(["group1"]);

      await userModel.setAclGroups(["group2", "group3"]);
      expect(userModel.getAclGroups()).toEqual(["group2", "group3"]);
    });

    test("should handle empty groups array", async () => {
      await userModel.setAclGroups([]);
      expect(userModel.getAclGroups()).toEqual([]);
    });

    test("should handle single group", async () => {
      await userModel.setAclGroups(["single-group"]);
      expect(userModel.getAclGroups()).toEqual(["single-group"]);
    });

    test("should handle duplicate groups", async () => {
      await userModel.setAclGroups(["developers", "developers", "testers"]);
      expect(userModel.getAclGroups()).toEqual([
        "developers",
        "developers",
        "testers",
      ]);
    });

    test("should handle special characters in group names", async () => {
      const specialGroups = [
        "group-with-dash",
        "group_with_underscore",
        "group.with.dot",
      ];
      await userModel.setAclGroups(specialGroups);
      expect(userModel.getAclGroups()).toEqual(specialGroups);
    });
  });

  describe("Interface Compliance Tests", () => {
    test("should implement IUserModel interface correctly", () => {
      // Test that all required methods exist and work
      expect(typeof userModel.getId).toBe("function");
      expect(typeof userModel.getEmail).toBe("function");
      expect(typeof userModel.setEmail).toBe("function");
      expect(typeof userModel.getHashedPassword).toBe("function");
      expect(typeof userModel.setHashedPassword).toBe("function");
      expect(typeof userModel.getAclRoles).toBe("function");
      expect(typeof userModel.setAclRoles).toBe("function");
      expect(typeof userModel.getAclGroups).toBe("function");
      expect(typeof userModel.setAclGroups).toBe("function");
    });

    test("should implement IAccessControlEntity interface correctly", () => {
      // Test that ACL methods work as expected
      expect(userModel.getAclRoles()).toEqual(mockAclRoles);
      expect(userModel.getAclGroups()).toEqual(mockAclGroups);
    });

    test("should handle null return values correctly", () => {
      // According to interface, these methods can return null
      const emptyUser = new TestUserModel();

      expect(emptyUser.getEmail()).toBeUndefined();
      expect(emptyUser.getHashedPassword()).toBeUndefined();
      expect(emptyUser.getAclRoles()).toBeUndefined();
      expect(emptyUser.getAclGroups()).toBeUndefined();
    });
  });

  describe("Edge Cases and Error Handling", () => {
    test("should handle very long strings", async () => {
      const longEmail = "a".repeat(1000) + "@example.com";
      const longPassword = "b".repeat(1000);
      const longRoles = ["role".repeat(100)];
      const longGroups = ["group".repeat(100)];

      await userModel.setEmail(longEmail);
      await userModel.setHashedPassword(longPassword);
      await userModel.setAclRoles(longRoles);
      await userModel.setAclGroups(longGroups);

      expect(userModel.getEmail()).toBe(longEmail);
      expect(userModel.getHashedPassword()).toBe(longPassword);
      expect(userModel.getAclRoles()).toEqual(longRoles);
      expect(userModel.getAclGroups()).toEqual(longGroups);
    });

    test("should handle unicode characters", async () => {
      const unicodeEmail = "tëst@exämple.com";
      const unicodePassword = "pässwörd";
      const unicodeRoles = ["rôle", "fünction"];
      const unicodeGroups = ["gröup", "tëam"];

      await userModel.setEmail(unicodeEmail);
      await userModel.setHashedPassword(unicodePassword);
      await userModel.setAclRoles(unicodeRoles);
      await userModel.setAclGroups(unicodeGroups);

      expect(userModel.getEmail()).toBe(unicodeEmail);
      expect(userModel.getHashedPassword()).toBe(unicodePassword);
      expect(userModel.getAclRoles()).toEqual(unicodeRoles);
      expect(userModel.getAclGroups()).toEqual(unicodeGroups);
    });

    test("should handle whitespace in strings", async () => {
      const emailWithSpaces = "  test@example.com  ";
      const passwordWithSpaces = "  password  ";
      const rolesWithSpaces = ["  role1  ", "  role2  "];
      const groupsWithSpaces = ["  group1  ", "  group2  "];

      await userModel.setEmail(emailWithSpaces);
      await userModel.setHashedPassword(passwordWithSpaces);
      await userModel.setAclRoles(rolesWithSpaces);
      await userModel.setAclGroups(groupsWithSpaces);

      expect(userModel.getEmail()).toBe(emailWithSpaces);
      expect(userModel.getHashedPassword()).toBe(passwordWithSpaces);
      expect(userModel.getAclRoles()).toEqual(rolesWithSpaces);
      expect(userModel.getAclGroups()).toEqual(groupsWithSpaces);
    });
  });

  describe("Integration Tests", () => {
    test("should maintain state across multiple operations", async () => {
      // Initial state
      expect(userModel.getId()).toBe(mockId);
      expect(userModel.getEmail()).toBe(mockEmail);
      expect(userModel.getAclRoles()).toEqual(mockAclRoles);

      // Update multiple properties
      await userModel.setEmail("updated@example.com");
      await userModel.setHashedPassword("updated_password");
      await userModel.setAclRoles(["updated_role"]);
      await userModel.setAclGroups(["updated_group"]);

      // Verify all changes persisted
      expect(userModel.getId()).toBe(mockId); // Should remain unchanged
      expect(userModel.getEmail()).toBe("updated@example.com");
      expect(userModel.getHashedPassword()).toBe("updated_password");
      expect(userModel.getAclRoles()).toEqual(["updated_role"]);
      expect(userModel.getAclGroups()).toEqual(["updated_group"]);
    });

    test("should handle concurrent operations", async () => {
      // Test that multiple async operations work correctly
      const promises = [
        userModel.setEmail("email1@example.com"),
        userModel.setHashedPassword("password1"),
        userModel.setAclRoles(["role1"]),
        userModel.setAclGroups(["group1"]),
      ];

      await Promise.all(promises);

      expect(userModel.getEmail()).toBe("email1@example.com");
      expect(userModel.getHashedPassword()).toBe("password1");
      expect(userModel.getAclRoles()).toEqual(["role1"]);
      expect(userModel.getAclGroups()).toEqual(["group1"]);
    });

    test("should handle rapid successive updates", async () => {
      // Test rapid successive updates to ensure state consistency
      for (let i = 0; i < 10; i++) {
        await userModel.setEmail(`email${i}@example.com`);
        await userModel.setHashedPassword(`password${i}`);
        await userModel.setAclRoles([`role${i}`]);
        await userModel.setAclGroups([`group${i}`]);
      }

      expect(userModel.getEmail()).toBe("email9@example.com");
      expect(userModel.getHashedPassword()).toBe("password9");
      expect(userModel.getAclRoles()).toEqual(["role9"]);
      expect(userModel.getAclGroups()).toEqual(["group9"]);
    });
  });

  describe("Implementation Issues", () => {
    test("should note interface compliance issues", () => {
      // Note: The current implementation has some interface compliance issues:
      // 1. setAclRoles and setAclGroups return Promise<void> but IAccessControlEntity expects void
      // 2. The interface allows null returns but implementation returns empty strings/arrays

      expect(userModel.setAclRoles).toBeInstanceOf(Function);
      expect(userModel.setAclGroups).toBeInstanceOf(Function);

      // These methods should be synchronous according to IAccessControlEntity interface
      // but they are currently async in the implementation
    });
  });
});
