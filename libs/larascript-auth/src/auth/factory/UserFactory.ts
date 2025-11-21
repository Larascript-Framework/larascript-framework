import { AuthenticableUserModelAttributes, IAuthenticableUserModel } from "@larascript-framework/contracts/auth";
import { ModelConstructor } from "@larascript-framework/larascript-database";
import { USER_ATTRIBUTES } from "../consts/UserAttributes.js";
import User from "../models/User.js";
import AuthenticableUserFactory from "./AuthenticableUserFactory.js";

export class UserFactory extends AuthenticableUserFactory {

    constructor(user: ModelConstructor<IAuthenticableUserModel> = User as ModelConstructor<IAuthenticableUserModel>) {
        super(user);
    }

    getDefinition(): NonNullable<AuthenticableUserModelAttributes> {
        return {
            // Include AuthenticableUser attributes
            ...super.getDefinition(),
            [USER_ATTRIBUTES.FIRST_NAME]: '',
            [USER_ATTRIBUTES.LAST_NAME]: '',
            [USER_ATTRIBUTES.CREATED_AT]: new Date(),
            [USER_ATTRIBUTES.UPDATED_AT]: new Date(),
        } as NonNullable<AuthenticableUserModelAttributes>;
    }

    testDefinition(): NonNullable<AuthenticableUserModelAttributes> {
        return {
            ...this.getDefinition(),
            [USER_ATTRIBUTES.FIRST_NAME]: this.faker.person.firstName(),
            [USER_ATTRIBUTES.LAST_NAME]: this.faker.person.lastName(),
            [USER_ATTRIBUTES.EMAIL]: this.faker.internet.email(),
            [USER_ATTRIBUTES.CREATED_AT]: new Date(),
            [USER_ATTRIBUTES.UPDATED_AT]: new Date(),
        } as NonNullable<User['attributes']>;
    }

}

export default UserFactory;
