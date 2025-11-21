import { IAccessControlEntity, IAclConfig, IAclGroup } from "@larascript-framework/contracts/acl";
import { TClassConstructor } from "../utils/compose.js";
import { BasicACLService } from "./BasicACLService.js";

/**
 * Composable ACL Mixin
 *
 * This mixin provides access control functionality that can be composed
 * into other classes using the compose utility. It uses the BasicACLService
 * internally to handle all ACL logic.
 *
 * Usage:
 * ```typescript
 * class User extends compose(BaseUser, ComposableACL(aclConfig)) {
 *   // User now has all ACL functionality
 * }
 * ```
 */
export const ComposableACL = <T extends TClassConstructor>(
  aclConfig: IAclConfig,
) => {
  return (BaseClass: T) => {
    return class extends BaseClass implements IAccessControlEntity {
      _aclRoles: string[] = [];
      _aclGroups: string[] = [];
      _aclService: BasicACLService;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      constructor(...args: any[]) {
        super(...args);
        this._aclService = new BasicACLService(aclConfig);
      }

      // IAccessControlEntity implementation
      getAclRoles(): string[] | null {
        return this._aclRoles.length > 0 ? this._aclRoles : null;
      }

      setAclRoles(roles: string[]): void {
        this._aclRoles = roles;
      }

      getAclGroups(): string[] | null {
        return this._aclGroups.length > 0 ? this._aclGroups : null;
      }

      setAclGroups(groups: string[]): void {
        this._aclGroups = groups;
      }

      // ACL Service methods - delegate to BasicACLService
      getConfig() {
        return this._aclService.getConfig();
      }

      getDefaultGroup() {
        return this._aclService.getDefaultGroup();
      }

      getGroup(group: string) {
        return this._aclService.getGroup(group);
      }

      getRole(role: string) {
        return this._aclService.getRole(role);
      }

      hasScope(scope: string): boolean {
        return this._aclService.hasScope(this, scope);
      }

      hasScopes(scopes: string[]): boolean {
        return this._aclService.hasScopes(this, scopes);
      }

      hasRole(role: string | string[]): boolean {
        return this._aclService.hasRole(this, role);
      }

      hasGroup(groups: string | string[]): boolean {
        return this._aclService.hasGroup(this, groups);
      }

      getRoleScopesFromUser(): string[] {
        return this._aclService.getRoleScopesFromUser(this);
      }

      getRoleScopes(role: string | string[]): string[] {
        return this._aclService.getRoleScopes(role);
      }

      getGroupRoles(group: string | IAclGroup) {
        return this._aclService.getGroupRoles(group);
      }

      getGroupScopes(group: string | IAclGroup): string[] {
        return this._aclService.getGroupScopes(group);
      }

      async assignRoleToUser(role: string | string[]): Promise<void> {
        return this._aclService.assignRoleToUser(this, role);
      }

      async appendRoleToUser(role: string): Promise<void> {
        return this._aclService.appendRoleToUser(this, role);
      }

      async removeRoleFromUser(role: string | string[]): Promise<void> {
        return this._aclService.removeRoleFromUser(this, role);
      }

      async assignGroupToUser(group: string | string[]): Promise<void> {
        return this._aclService.assignGroupToUser(this, group);
      }

      async appendGroupToUser(group: string): Promise<void> {
        return this._aclService.appendGroupToUser(this, group);
      }

      async removeGroupFromUser(group: string | string[]): Promise<void> {
        return this._aclService.removeGroupFromUser(this, group);
      }
    };
  };
};
