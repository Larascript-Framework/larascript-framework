import { AuthenticableUserModelAttributes, IAuthenticableUserModel } from "@larascript-framework/contracts/auth";
import { ModelConstructor } from "@larascript-framework/larascript-database";
import { BASE_USER_ATTRIBUTES } from "../consts/BaseUserAttributes.js";
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
            [BASE_USER_ATTRIBUTES.FIRST_NAME]: '',
            [BASE_USER_ATTRIBUTES.LAST_NAME]: '',
            [BASE_USER_ATTRIBUTES.CREATED_AT]: new Date(),
            [BASE_USER_ATTRIBUTES.UPDATED_AT]: new Date(),
        } as NonNullable<AuthenticableUserModelAttributes>;
    }

    testDefinition(): NonNullable<AuthenticableUserModelAttributes> {
        return {
            ...this.getDefinition(),
            [BASE_USER_ATTRIBUTES.FIRST_NAME]: this.faker.person.firstName(),
            [BASE_USER_ATTRIBUTES.LAST_NAME]: this.faker.person.lastName(),
            [BASE_USER_ATTRIBUTES.EMAIL]: this.faker.internet.email(),
            [BASE_USER_ATTRIBUTES.CREATED_AT]: new Date(),
            [BASE_USER_ATTRIBUTES.UPDATED_AT]: new Date(),
        } as NonNullable<User['attributes']>;
    }

}

export default UserFactory;
