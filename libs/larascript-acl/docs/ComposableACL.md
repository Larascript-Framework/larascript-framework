# Composable ACL

The Composable ACL provides a mixin-based approach to add access control functionality to any class using the `compose` utility.

## Overview

The `ComposableACL` is a higher-order function that returns a mixin function, which can be used with the `compose` utility to add ACL functionality to any class. This approach allows for better separation of concerns and reusability.

## Usage

### Basic Usage

```typescript
import { compose } from "../utils/compose";
import { ComposableACL, IAclConfig } from "../acl/ComposableACL";

// Define your ACL configuration
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
  ],
  roles: [
    {
      name: "role_admin",
      scopes: ["admin:read", "admin:write"],
    },
    {
      name: "role_user",
      scopes: ["user:read", "user:write"],
    },
  ],
};

// Base class
class BaseUser {
  constructor(public id: string, public email: string) {}
}

// User class with ACL functionality
class User extends compose(BaseUser, ComposableACL(aclConfig)) {
  constructor(id: string, email: string) {
    super(id, email);
  }
}
```

### Using the Composed Class

```typescript
const user = new User("1", "john@example.com");

// Assign roles
await user.assignRoleToUser("role_user");
await user.appendRoleToUser("role_admin");

// Check permissions
console.log(user.hasScope("user:read")); // true
console.log(user.hasScope("admin:write")); // true
console.log(user.hasRole("role_admin")); // true

// Get all scopes
const scopes = user.getRoleScopesFromUser();
console.log(scopes); // ["user:read", "user:write", "admin:read", "admin:write"]
```

## Available Methods

### Role Management

- `assignRoleToUser(role: string | string[])`: Assign roles to the user
- `appendRoleToUser(role: string)`: Add a role to existing roles
- `removeRoleFromUser(role: string | string[])`: Remove roles from the user
- `hasRole(role: string | string[])`: Check if user has specific role(s)

### Scope Management

- `hasScope(scope: string)`: Check if user has specific scope
- `hasScopes(scopes: string[])`: Check if user has all specified scopes
- `getRoleScopesFromUser()`: Get all scopes from user's roles
- `getRoleScopes(role: string | string[])`: Get scopes for specific role(s)

### Group Management

- `assignGroupToUser(group: string | string[])`: Assign groups to the user
- `appendGroupToUser(group: string)`: Add a group to existing groups
- `removeGroupFromUser(group: string | string[])`: Remove groups from the user
- `hasGroup(groups: string | string[])`: Check if user has specific group(s)

### Configuration Access

- `getConfig()`: Get the ACL configuration
- `getDefaultGroup()`: Get the default group
- `getGroup(group: string)`: Get a specific group
- `getRole(role: string)`: Get a specific role
- `getGroupRoles(group: string | IAclGroup)`: Get roles for a group
- `getGroupScopes(group: string | IAclGroup)`: Get scopes for a group

## Advanced Usage

### Multiple Mixins

You can combine multiple mixins using the compose utility:

```typescript
class AdvancedUser extends compose(
  BaseUser,
  ComposableACL(aclConfig),
  OtherMixin(),
  AnotherMixin()
) {
  // Your user implementation
}
```

### Custom ACL Configuration

You can create different ACL configurations for different contexts:

```typescript
const adminAclConfig: IAclConfig = {
  defaultGroup: "Admin",
  groups: [
    {
      name: "SuperAdmin",
      roles: ["role_super_admin"],
    },
  ],
  roles: [
    {
      name: "role_super_admin",
      scopes: ["*"],
    },
  ],
};

class AdminUser extends compose(BaseUser, ComposableACL(adminAclConfig)) {
  // Admin user implementation
}
```

## Benefits

1. **Separation of Concerns**: ACL functionality is separated from business logic
2. **Reusability**: The same ACL mixin can be used across different classes
3. **Composability**: Can be combined with other mixins using the compose utility
4. **Type Safety**: Full TypeScript support with proper type inference
5. **Flexibility**: Different ACL configurations can be used for different contexts

## Error Handling

The ComposableACL throws `BasicACLException` for:
- Non-existent roles
- Non-existent groups
- Invalid configurations

```typescript
try {
  user.getRole("non_existent_role");
} catch (error) {
  console.error(error.message); // "Role non_existent_role not found"
}
```
