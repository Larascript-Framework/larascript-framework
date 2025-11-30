import { TCastableType } from "@larascript-framework/cast-js";
import { AuthenticableUserModelAttributes } from "@larascript-framework/contracts/auth";
import { BASE_USER_ATTRIBUTES } from "../consts/BaseUserAttributes.js";
import UserObserver from "../observers/UserObserver.js";
import AuthenticableUserModel from "./AuthenticableUserModel.js";

/**
 * User structure
 */
export interface UserAttributes extends AuthenticableUserModelAttributes {

    // AuthenticableUser attributes
    id: string;
    email: string;
    hashedPassword: string;
    aclRoles: string[];
    aclGroups: string[];

    // Additional fields
    password?: string;
    firstName?: string;
    lastName?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

/**
 * User model
 *
 * Represents a user in the database.
 */
export class User extends AuthenticableUserModel {

    /**
     * Table name
     */

    public table: string = 'users';

    /**
     * @param data User data
     */
    constructor(data: UserAttributes | null = null) {
        super(data);
        this.setObserverConstructor(UserObserver);
    }
    
    protected casts?: Record<string, TCastableType> | undefined = {
        [BASE_USER_ATTRIBUTES.ACL_ROLES]: 'array',
        [BASE_USER_ATTRIBUTES.ACL_GROUPS]: 'array',
        [BASE_USER_ATTRIBUTES.CREATED_AT]: 'date',
        [BASE_USER_ATTRIBUTES.UPDATED_AT]: 'date',
    }

    /**
     * Guarded fields
     *
     * These fields cannot be set directly.
     */
    guarded: string[] = [
        BASE_USER_ATTRIBUTES.HASHED_PASSWORD,
        BASE_USER_ATTRIBUTES.PASSWORD,
        BASE_USER_ATTRIBUTES.ACL_ROLES,
        BASE_USER_ATTRIBUTES.ACL_GROUPS,
    ];

    /**
     * The fields that are allowed to be set directly
     *
     * These fields can be set directly on the model.
     */
    fields: string[] = [
        
        // fields required by AuthenticableUser
        BASE_USER_ATTRIBUTES.EMAIL,
        BASE_USER_ATTRIBUTES.HASHED_PASSWORD,
        BASE_USER_ATTRIBUTES.ACL_ROLES,
        BASE_USER_ATTRIBUTES.ACL_GROUPS,
        
        // fields required by User
        BASE_USER_ATTRIBUTES.FIRST_NAME,
        BASE_USER_ATTRIBUTES.LAST_NAME,
        BASE_USER_ATTRIBUTES.CREATED_AT,
        BASE_USER_ATTRIBUTES.UPDATED_AT,
    ]

    /**
     * Retrieves the fields defined on the model, minus the password field.
     * As this is a temporary field and shouldn't be saved to the database.
     * 
     * @returns The list of fields defined on the model.
     */
    getFields(): string[] {
        return super.getFields().filter(field => ![BASE_USER_ATTRIBUTES.PASSWORD].includes(field));
    }
}

export default User;