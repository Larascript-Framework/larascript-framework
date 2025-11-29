import UserFactory from "@/app/factory/UserFactory.js";
import UserObserver from "@/app/observers/UserObserver.js";
import { TCastableType } from "@larascript-framework/cast-js";
import {
  AuthenticableUserModelAttributes,
  USER_ATTRIBUTES as BASE_USER_ATTRIBUTES,
  User as BaseUserModel,
  IAuthenticableUserModel,
} from "@larascript-framework/larascript-auth";
import { IModelFactory } from "@larascript-framework/larascript-database";

export const USER_ATTRIBUTES = {
  ...BASE_USER_ATTRIBUTES,
} as const;

/**
 * User structure
 */
export interface UserAttributes extends AuthenticableUserModelAttributes {
  // AuthenticableUser attributes
  id: string;
  email: string;
  hashedPassword: string;
  roles: string[];
  groups: string[];

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
export default class User extends BaseUserModel {
  public static PASSWORD = "password";

  public static FIRST_NAME = "firstName";

  public static LAST_NAME = "lastName";

  public static CREATED_AT = "createdAt";

  public static UPDATED_AT = "updatedAt";

  /**
   * Table name
   */

  public table: string = "users";

  /**
   * @param data User data
   */
  constructor(data: UserAttributes | null = null) {
    super(data);
    this.setObserverConstructor(UserObserver);
  }

  protected casts?: Record<string, TCastableType> | undefined = {
    [USER_ATTRIBUTES.ACL_GROUPS]: "array",
    [USER_ATTRIBUTES.ACL_ROLES]: "array",
    [USER_ATTRIBUTES.CREATED_AT]: "date",
    [USER_ATTRIBUTES.UPDATED_AT]: "date",
  };

  /**
   * Guarded fields
   *
   * These fields cannot be set directly.
   */
  guarded: string[] = [
    USER_ATTRIBUTES.HASHED_PASSWORD,
    USER_ATTRIBUTES.PASSWORD,
    USER_ATTRIBUTES.ACL_GROUPS,
    USER_ATTRIBUTES.ACL_ROLES,
  ];

  /**
   * The fields that are allowed to be set directly
   *
   * These fields can be set directly on the model.
   */
  fields: string[] = [
    // fields required by AuthenticableUser
    USER_ATTRIBUTES.EMAIL,
    USER_ATTRIBUTES.HASHED_PASSWORD,
    USER_ATTRIBUTES.ACL_GROUPS,
    USER_ATTRIBUTES.ACL_ROLES,

    // fields required by User
    USER_ATTRIBUTES.PASSWORD, // temporary field
    USER_ATTRIBUTES.FIRST_NAME,
    USER_ATTRIBUTES.LAST_NAME,
    USER_ATTRIBUTES.CREATED_AT,
    USER_ATTRIBUTES.UPDATED_AT,
  ];

  /**
   * Retrieves the fields defined on the model, minus the password field.
   * As this is a temporary field and shouldn't be saved to the database.
   *
   * @returns The list of fields defined on the model.
   */
  getFields(): string[] {
    return super
      .getFields()
      .filter((field) => ![USER_ATTRIBUTES.PASSWORD as string].includes(field));
  }

  /**
   * Retrieves the factory for the model.
   *
   * @returns The factory for the model.
   */
  getFactory(): IModelFactory<IAuthenticableUserModel> {
    return new UserFactory();
  }
}
