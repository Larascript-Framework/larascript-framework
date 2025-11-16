
/**
 * The default condition for when the security check should be executed.
 */
export const ALWAYS = 'always';

/**
 * The security rule identifiers.
 */
export const SecurityEnum = {
    RESOURCE_OWNER: 'resourceOwner',
    HAS_ROLE: 'hasRole',
    RATE_LIMITED: 'rateLimited',
    ENABLE_SCOPES: 'enableScopes',
    CUSTOM: 'custom'
} as const;