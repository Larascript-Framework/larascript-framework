import { IAclConfig } from "@larascript-framework/contracts/acl";
import { ComposableACL } from "../acl/ComposableACL.js";
import { compose } from "../utils/compose.js";

// Example ACL configuration
const aclConfig: IAclConfig = {
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

// Base User class
class BaseUser {
  constructor(
    public id: string,
    public email: string,
    public name: string,
  ) {}
}

// User class with ACL functionality composed in
export class User extends compose(BaseUser, ComposableACL(aclConfig)) {
  constructor(id: string, email: string, name: string) {
    super(id, email, name);
  }

  // Additional user-specific methods
  getDisplayName(): string {
    return this.name;
  }

  getEmail(): string {
    return this.email;
  }
}

// Example usage
export const createUserWithACL = async () => {
  const user = new User("1", "john@example.com", "John Doe");

  // Assign roles to the user
  await user.assignRoleToUser("role_user");
  await user.appendRoleToUser("role_moderator");

  // Check permissions
  console.log("Has user:read scope:", user.hasScope("user:read")); // true
  console.log("Has admin:write scope:", user.hasScope("admin:write")); // false
  console.log("Has moderator role:", user.hasRole("role_moderator")); // true

  // Get all scopes for the user
  const scopes = user.getRoleScopesFromUser();
  console.log("User scopes:", scopes); // ["user:read", "user:write", "moderator:read", "moderator:write"]

  return user;
};
