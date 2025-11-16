export type RouteResourceTypes = (typeof RouteResourceTypes)[keyof typeof RouteResourceTypes]

/**
 * Resource types that can be utilized when adding Security to a route
 */
export const RouteResourceTypes = {
    INDEX: 'index',
    SHOW: 'show',
    CREATE: 'create',
    UPDATE: 'update',
    DELETE: 'delete'
} as const