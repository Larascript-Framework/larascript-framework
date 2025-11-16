export interface IAccessControlEntity {
  getAclRoles(): string[] | null;
  setAclRoles(roles: string[]): void;
  getAclGroups(): string[] | null;
  setAclGroups(groups: string[]): void;
}

export interface IAclConfig {
  defaultGroup: string;
  groups: IAclGroup[];
  roles: IAclRole[];
}

export interface IAclGroup {
  name: string;
  roles: string[];
}

export interface IAclRole {
  name: string;
  scopes: string[];
}

export interface IBasicACLService {
  getConfig(): IAclConfig;
  getDefaultGroup(): IAclGroup;
  getGroup(group: string | IAclGroup): IAclGroup;
  getGroupRoles(group: string | IAclGroup): IAclRole[];
  getGroupScopes(group: string | IAclGroup): string[];
  getRoleScopesFromUser(entity: IAccessControlEntity): string[];
  getRoleScopes(role: string | string[]): string[];
  getRole(role: string): IAclRole;
  hasScope(entity: IAccessControlEntity, scope: string): boolean;
  hasScopes(entity: IAccessControlEntity, scopes: string[]): boolean;
  hasRole(entity: IAccessControlEntity, role: string | string[]): boolean;
  hasGroup(entity: IAccessControlEntity, groups: string | string[]): boolean;
  assignRoleToUser(
    entity: IAccessControlEntity,
    role: string | string[],
  ): Promise<void>;
  appendRoleToUser(entity: IAccessControlEntity, role: string): Promise<void>;
  assignGroupToUser(
    entity: IAccessControlEntity,
    group: string | string[],
  ): Promise<void>;
  appendGroupToUser(entity: IAccessControlEntity, group: string): Promise<void>;
  removeRoleFromUser(
    usdataer: IAccessControlEntity,
    role: string | string[],
  ): Promise<void>;
  removeGroupFromUser(
    entity: IAccessControlEntity,
    group: string | string[],
  ): Promise<void>;
}
