# Larascript ACL Bundle

A lightweight Access Control List (ACL) service for the Larascript Framework that provides role-based access control (RBAC) functionality.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
  - [Service-based Approach](#service-based-approach)
  - [Composable ACL Approach](#composable-acl-approach)
- [API Reference](#api-reference)
  - [Core Service Methods](#core-service-methods)
  - [Interfaces](#interfaces)
  - [Error Handling](#error-handling)
- [Usage Examples](#usage-examples)
  - [Basic Permission Checking](#basic-permission-checking)
  - [Role-based Access Control](#role-based-access-control)
  - [Group-based Access Control](#group-based-access-control)
  - [Role and Group Management](#role-and-group-management)
  - [Getting Permissions and Scopes](#getting-permissions-and-scopes)
- [Development](#development)
- [License](#license)

## Features

- **Role Management**: Define roles with specific permissions/scopes
- **Group Management**: Organize roles into groups for easier administration
- **User Assignment**: Assign roles and groups to users
- **Permission Validation**: Check user permissions based on their roles
- **Composable ACL**: Mixin-based approach for adding ACL functionality to any class
- **TypeScript Support**: Full type safety with TypeScript interfaces
- **Custom Exceptions**: Dedicated `BasicACLException` for error handling

## Installation

```bash
npm install ben-shepherd/larascript-acl
```

## Quick Start

### Service-based Approach

```typescript
import { BasicACLService, IAclConfig, BasicACLException } from '@ben-shepherd/larascript-acl';

// Define your ACL configuration
const aclConfig: IAclConfig = {
  defaultGroup: 'user',
  groups: [
    {
      name: 'admin',
      roles: ['role_admin', 'role_moderator']
    },
    {
      name: 'user', 
      roles: ['role_user']
    },
    {
      name: 'moderator',
      roles: ['role_moderator']
    }
  ],
  roles: [
    {
      name: 'role_admin',
      scopes: ['read:all', 'write:all', 'delete:all']
    },
    {
      name: 'role_moderator',
      scopes: ['read:all', 'write:limited', 'delete:limited']
    },
    {
      name: 'role_user',
      scopes: ['read:own', 'write:own']
    }
  ]
};

// Initialize the service
const aclService = new BasicACLService(aclConfig);

// Use with your user entity
const user = {
  getAclRoles: () => ['role_user'],
  setAclRoles: (roles: string[]) => { /* implementation */ },
  getAclGroups: () => ['user'],
  setAclGroups: (groups: string[]) => { /* implementation */ }
};

// Check user permissions
const hasReadPermission = aclService.hasScope(user, 'read:own');
// Returns: true

const hasAllPermissions = aclService.hasScopes(user, ['read:own', 'write:own']);
// Returns: true

// Check user roles
const hasAdminRole = aclService.hasRole(user, 'role_admin');
// Returns: false

// Get user permissions
const scopes = aclService.getRoleScopesFromUser(user);
// Returns: ['read:own', 'write:own']
```

### Composable ACL Approach

For a more object-oriented approach, you can use the Composable ACL mixin to add ACL functionality directly to your classes:

```typescript
import { compose } from '@ben-shepherd/larascript-acl/utils';
import { ComposableACL, IAclConfig } from '@ben-shepherd/larascript-acl';

// Define your ACL configuration
const aclConfig: IAclConfig = {
  defaultGroup: 'user',
  groups: [
    {
      name: 'admin',
      roles: ['role_admin']
    },
    {
      name: 'user', 
      roles: ['role_user']
    }
  ],
  roles: [
    {
      name: 'role_admin',
      scopes: ['read:all', 'write:all', 'delete:all']
    },
    {
      name: 'role_user',
      scopes: ['read:own', 'write:own']
    }
  ]
};

// Base user class
class BaseUser {
  constructor(public id: string, public email: string) {}
}

// User class with ACL functionality
class User extends compose(BaseUser, ComposableACL(aclConfig)) {
  constructor(id: string, email: string) {
    super(id, email);
  }
}

// Usage
const user = new User('1', 'john@example.com');
await user.assignRoleToUser('role_user');

// Check permissions directly on the user object
console.log(user.hasScope('read:own')); // true
console.log(user.hasRole('role_user')); // true
```

For more details on the Composable ACL approach, see the [Composable ACL Documentation](docs/ComposableACL.md).

## API Reference

### Core Service Methods

#### Permission Checking
- `hasScope(entity, scope)` - Check if user has a specific scope
- `hasScopes(entity, scopes)` - Check if user has all specified scopes
- `hasRole(entity, role)` - Check if user has specified role(s)
- `hasGroup(entity, groups)` - Check if user belongs to specified group(s)

#### Role Management
- `getRole(roleName)` - Get role configuration by name
- `getRoleScopes(role)` - Get scopes for role(s)
- `getRoleScopesFromUser(entity)` - Get all scopes for a user's roles
- `assignRoleToUser(entity, role)` - Assign role(s) to user (overwrites existing)
- `appendRoleToUser(entity, role)` - Add role to user's existing roles
- `removeRoleFromUser(entity, role)` - Remove role(s) from user

#### Group Management
- `getGroup(groupName)` - Get group configuration by name
- `getDefaultGroup()` - Get the default group configuration
- `getGroupRoles(group)` - Get all roles in a group
- `getGroupScopes(group)` - Get all scopes in a group
- `assignGroupToUser(entity, group)` - Assign group(s) to user (overwrites existing)
- `appendGroupToUser(entity, group)` - Add group to user's existing groups
- `removeGroupFromUser(entity, group)` - Remove group(s) from user

#### Configuration
- `getConfig()` - Get the current ACL configuration

### Interfaces

#### IAccessControlEntity
Your user entities must implement this interface:

```typescript
interface IAccessControlEntity {
  getAclRoles(): string[] | null;
  setAclRoles(roles: string[]): void;
  getAclGroups(): string[] | null;
  setAclGroups(groups: string[]): void;
}
```

#### IAclConfig
Configuration object for the ACL service:

```typescript
interface IAclConfig {
  defaultGroup: string;
  groups: IAclGroup[];
  roles: IAclRole[];
}

interface IAclGroup {
  name: string;
  roles: string[];
}

interface IAclRole {
  name: string;
  scopes: string[];
}
```

### Error Handling

The service uses `BasicACLException` for all error scenarios:

```typescript
import { BasicACLException } from '@ben-shepherd/larascript-acl';

try {
  const role = aclService.getRole('non-existent-role');
} catch (error) {
  if (error instanceof BasicACLException) {
    console.log('ACL Error:', error.message);
    // Handle ACL-specific error
  }
}
```

## Usage Examples

### Basic Permission Checking

```typescript
// Check single permission
if (aclService.hasScope(user, 'read:all')) {
  // User can read all data
}

// Check multiple permissions (ALL must be present)
if (aclService.hasScopes(user, ['read:all', 'write:limited'])) {
  // User has both permissions
}
```

### Role-based Access Control

```typescript
// Check if user has a specific role
if (aclService.hasRole(user, 'role_admin')) {
  // User is an admin
}

// Check if user has multiple roles (ALL must be present)
if (aclService.hasRole(user, ['role_admin', 'role_moderator'])) {
  // User has both admin and moderator roles
}
```

### Group-based Access Control

```typescript
// Check if user belongs to admin group
if (aclService.hasGroup(user, 'admin')) {
  // User is an admin
}

// Check if user belongs to multiple groups (ALL must be present)
if (aclService.hasGroup(user, ['admin', 'moderator'])) {
  // User belongs to both groups
}
```

### Role and Group Management

```typescript
// Assign roles to user
await aclService.assignRoleToUser(user, 'role_admin');
await aclService.assignRoleToUser(user, ['role_admin', 'role_moderator']);

// Add role without overwriting existing ones
await aclService.appendRoleToUser(user, 'role_user');

// Remove specific roles
await aclService.removeRoleFromUser(user, 'role_moderator');

// Assign groups to user
await aclService.assignGroupToUser(user, 'admin');
await aclService.appendGroupToUser(user, 'moderator');
```

### Getting Permissions and Scopes

```typescript
// Get all scopes for a user
const userScopes = aclService.getRoleScopesFromUser(user);

// Get scopes for specific roles
const adminScopes = aclService.getRoleScopes('role_admin');
const multipleRoleScopes = aclService.getRoleScopes(['role_admin', 'role_user']);

// Get roles in a group
const adminRoles = aclService.getGroupRoles('admin');

// Get scopes in a group
const adminGroupScopes = aclService.getGroupScopes('admin');
```

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Build
npm run build

# Lint and format
npm run lint:fix
npm run format
```

## License

ISC