import {
  BasicACLException,
  IAccessControlEntity,
  IAclConfig,
  IAclGroup,
  IAclRole,
  IBasicACLService,
} from "./index.js";

/**
 * Access Control List (ACL) Service
 *
 * This service manages role-based access control (RBAC) by:
 * - Managing user groups and their associated roles
 * - Managing roles and their associated permissions/scopes
 * - Providing methods to retrieve and validate permissions
 *
 * The service works with a configuration object that defines:
 * - Groups (e.g. 'Admin', 'User')
 * - Roles (e.g. 'role_admin', 'role_user')
 * - Scopes/permissions for each role
 */
export class BasicACLService implements IBasicACLService {
  constructor(private readonly aclConfig: IAclConfig) {
    this.aclConfig = aclConfig;
  }

  /**
   * Get the ACL config
   * @returns
   */
  getConfig(): IAclConfig {
    return this.aclConfig;
  }

  /**
   * Checks if the user has the given scope
   *
   * @param scope The scope to check
   * @returns True if the user has the scope, false otherwise
   */
  hasScope(entity: IAccessControlEntity, scope: string): boolean {
    const roles = entity.getAclRoles() ?? [];

    for (const roleName of roles) {
      const role = this.getRole(roleName);
      if (role.scopes.includes(scope)) return true;
    }

    return false;
  }

  /**
   * Checks if the user has any of the given scopes
   *
   * @param scopes The scopes to check
   * @returns True if the user has any of the scopes, false otherwise
   */
  hasScopes(entity: IAccessControlEntity, scopes: string[]): boolean {
    for (const scope of scopes) {
      if (!this.hasScope(entity, scope)) return false;
    }

    return true;
  }

  /**
   * Retrieves the scopes from the roles
   * @param data
   * @returns
   */
  getRoleScopesFromUser(entity: IAccessControlEntity): string[] {
    const roles = entity.getAclRoles();

    if (!roles) {
      return [];
    }

    let scopes: string[] = [];

    for (const roleString of roles) {
      const role = this.getRole(roleString);
      scopes = [...scopes, ...role.scopes];
    }

    return scopes;
  }

  /**
   * Retrieves the role from the config
   * @param role
   * @returns
   */
  getRole(role: string): IAclRole {
    const result = this.aclConfig.roles.find((r) => r.name === role);

    if (!result) {
      throw new BasicACLException(`Role ${role} not found`);
    }

    return result;
  }

  /**
   * Retrieves the scopes from the roles
   * @param role
   * @returns
   */
  getRoleScopes(role: string | string[]): string[] {
    const rolesArray = typeof role === "string" ? [role] : role;
    let scopes: string[] = [];

    for (const roleStr of rolesArray) {
      const role = this.getRole(roleStr);
      scopes = [...scopes, ...role.scopes];
    }

    return scopes;
  }

  /**
   * Assigns a role to a user
   * @param data
   * @param role
   */
  async assignRoleToUser(
    entity: IAccessControlEntity,
    role: string | string[],
  ): Promise<void> {
    const rolesArray = typeof role === "string" ? [role] : role;
    entity.setAclRoles(rolesArray);
  }

  /**
   * Appends a role to a user
   * @param user
   * @param role
   */
  async appendRoleToUser(
    entity: IAccessControlEntity,
    role: string,
  ): Promise<void> {
    const currentRoles = entity.getAclRoles() ?? [];
    const newRoles = [...currentRoles, role];

    entity.setAclRoles(newRoles);
  }

  /**
   * Removes a role from a user
   * @param user
   * @param role
   */
  async removeRoleFromUser(
    entity: IAccessControlEntity,
    role: string | string[],
  ): Promise<void> {
    const rolesArray = typeof role === "string" ? [role] : role;
    const currentRoles = entity.getAclRoles() ?? [];
    const newRoles = currentRoles.filter(
      (r) => false === rolesArray.includes(r),
    );

    entity.setAclRoles(newRoles);
  }

  /**
   * Get the default group
   * @returns
   */
  getDefaultGroup(): IAclGroup {
    return this.getGroup(this.aclConfig.defaultGroup);
  }

  /**
   * Get the group
   * @param group
   * @returns
   */
  getGroup(group: string | IAclGroup): IAclGroup {
    const groupName = typeof group === "string" ? group : group.name;
    const result = this.aclConfig.groups.find((g) => g.name === groupName);

    if (!result) {
      throw new BasicACLException(`Group ${groupName} not found`);
    }

    return result;
  }

  /**
   * Checks if the user has the given role
   *
   * @param entity The access control entity to check
   * @param role The role(s) to check
   * @returns True if the user has the role(s), false otherwise
   */
  hasRole(entity: IAccessControlEntity, role: string | string[]): boolean {
    const rolesArray = typeof role === "string" ? [role] : role;
    const userRoles = entity.getAclRoles() ?? [];

    for (const requiredRole of rolesArray) {
      if (!userRoles.includes(requiredRole)) return false;
    }

    return true;
  }

  /**
   * Checks if the user has the given group
   *
   * @param role The role to check
   * @returns True if the user has the role, false otherwise
   */
  hasGroup(entity: IAccessControlEntity, groups: string | string[]): boolean {
    groups = typeof groups === "string" ? [groups] : groups;
    const foundGroups = entity.getAclGroups() ?? ([] as string[]);

    for (const group of groups) {
      if (!foundGroups.includes(group)) return false;
    }

    return true;
  }

  /**
   * Get the roles from the group
   * @param group
   * @returns
   */
  getGroupRoles(group: string | IAclGroup): IAclRole[] {
    const groupResult =
      typeof group === "string" ? this.getGroup(group) : group;
    return groupResult.roles.map((role) => this.getRole(role));
  }

  /**
   * Get the scopes from the group
   * @param group
   * @returns
   */
  getGroupScopes(group: string | IAclGroup): string[] {
    const roles = this.getGroupRoles(group);
    return roles.map((role) => role.scopes).flat();
  }

  /**
   * Assigns a group to a user
   * @param user
   * @param group
   */
  async assignGroupToUser(
    entity: IAccessControlEntity,
    group: string | string[],
  ): Promise<void> {
    const groupsArray = typeof group === "string" ? [group] : group;

    entity.setAclGroups(groupsArray);
  }

  /**
   * Appends a group to a user
   * @param data
   * @param group
   */
  async appendGroupToUser(
    entity: IAccessControlEntity,
    group: string,
  ): Promise<void> {
    const currentGroups = entity.getAclGroups() ?? [];
    const newGroups = [...currentGroups, group];

    entity.setAclGroups(newGroups);
  }

  /**
   * Removes a group from a user
   * @param user
   * @param group
   */
  async removeGroupFromUser(
    entity: IAccessControlEntity,
    group: string | string[],
  ): Promise<void> {
    const groupsArray = typeof group === "string" ? [group] : group;
    const currentGroups = entity.getAclGroups() ?? [];
    const newGroups = currentGroups.filter(
      (g) => false === groupsArray.includes(g),
    );

    entity.setAclGroups(newGroups);
  }
}

export default BasicACLService;
