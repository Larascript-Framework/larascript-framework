import { IAclConfig } from "@larascript-framework/larascript-acl"

// Define available groups
export const GROUPS = {
    USER: 'group_user',
    ADMIN: 'group_admin',
} as const

// Define available roles
export const ROLES = {
    USER: 'role_user',
    ADMIN: 'role_admin'
} as const

/**
 * ACL configuration
 */
export const aclConfig: IAclConfig = {

    // Default user group
    defaultGroup: GROUPS.USER,

    // List of groups
    groups: [
        {
            name: GROUPS.USER,
            roles: [ROLES.USER]
        },
        {
            name: GROUPS.ADMIN,
            roles: [ROLES.USER, ROLES.ADMIN]
        }
    ],

    // List of roles, scopes and other permissions
    roles: [
        {
            name: ROLES.ADMIN,
            scopes: []
        },
        {
            name: ROLES.USER,
            scopes: []
        },
    ],

}