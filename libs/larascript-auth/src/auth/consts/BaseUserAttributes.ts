export const BASE_USER_ATTRIBUTES: Record<string, string> = {
    ID: 'id',
    EMAIL: 'email',
    FIRST_NAME: 'firstName',
    LAST_NAME: 'lastName',
    PASSWORD: 'password',
    HASHED_PASSWORD: 'hashedPassword',
    ACL_ROLES: 'aclRoles',
    ACL_GROUPS: 'aclGroups',
    CREATED_AT: 'createdAt',
    UPDATED_AT: 'updatedAt',
} as const;