import { IUserModel } from "@src/core/domains/auth/interfaces/models/IUserModel";
import UserObserver from "@src/core/domains/auth/observers/UserObserver";
import Model from "@src/core/domains/models/base/Model";
import { IModelAttributes } from "@src/core/domains/models/interfaces/IModel";

import { acl } from "../../acl/services/ACLService";

/**
 * User structure
 */
export interface AuthUserAttributes extends IModelAttributes {
    email: string;
    password?: string;
    hashedPassword: string;
    roles: string[];
    groups: string[];
}

/**
 * User model
 *
 * Represents a user in the database.
 */
export default class AuthUser<Attributes extends AuthUserAttributes> extends Model<Attributes> implements IUserModel {

    public static PASSWORD = 'password';

    public static HASHED_PASSWORD = 'hashedPassword';

    public static GROUPS = 'groups';

    public static ROLES = 'roles';

    public table: string = 'users';

    /**
     * @param data User data
     */
    constructor(data: Attributes | null = null) {
        super(data);
        this.setObserverConstructor(UserObserver);
    }

    hasRole(role: string | string[]): boolean {
        return acl().hasRole(this, role)
    }

    getAclRoles(): string[] | null {
        return (this.attrSync(AuthUser.ROLES) ?? []) as string []
    }

    setAclRoles(roles: string[]): void {
        this.setAttribute(AuthUser.ROLES, roles)
    }

    getAclGroups(): string[] | null {
        return (this.attrSync(AuthUser.GROUPS) ?? []) as string[]
    }

    setAclGroups(groups: string[]): void {
        this.setAttribute(AuthUser.GROUPS, groups)
    }

    /**
     * Guarded fields
     *
     * These fields cannot be set directly.
     */
    guarded: string[] = [
        'hashedPassword',
        'password',
        'roles',
        'groups',
    ];

    /**
     * The fields that are allowed to be set directly
     *
     * These fields can be set directly on the model.
     */
    fields: string[] = [
        'email',
        'password',
        'hashedPassword',
        'roles',
        'groups',
        'createdAt',
        'updatedAt',
    ]

    /**
     * Retrieves the fields defined on the model, minus the password field.
     * As this is a temporary field and shouldn't be saved to the database.
     * 
     * @returns The list of fields defined on the model.
     */
    getFields(): string[] {
        return super.getFields().filter(field => !['password'].includes(field));
    }

    /**
     * Get the email of the user
     * 
     * @returns The email of the user
     */
    getEmail(): string | null {
        return this.getAttributeSync('email');
    }


    /**
     * Set the email of the user
     * 
     * @param email The email to set
     * @returns The email of the user
     */
    setEmail(email: string): Promise<void> {
        return this.setAttribute('email', email);
    }

    /**
     * Get the hashed password of the user
     * 
     * @returns The hashed password of the user
     */

    getHashedPassword(): string | null {
        return this.getAttributeSync('hashedPassword');
    }

    /**
     * Set the hashed password of the user
     * 
     * @param hashedPassword The hashed password to set
     * @returns The hashed password of the user
     */
    setHashedPassword(hashedPassword: string): Promise<void> {
        return this.setAttribute('hashedPassword', hashedPassword);
    }


}
