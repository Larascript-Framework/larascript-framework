import { AuthenticableUserModelAttributes, IAuthenticableUserModel, IUserFactory } from "@larascript-framework/contracts/auth";
import { BaseModelFactory, ModelConstructor } from "@larascript-framework/larascript-database";
import { BASE_USER_ATTRIBUTES } from "../consts/BaseUserAttributes.js";

export class AuthenticableUserFactory<T extends IAuthenticableUserModel = IAuthenticableUserModel> extends BaseModelFactory<T> implements IUserFactory {

    constructor(modelConstructor: ModelConstructor<T>) {
        super(modelConstructor);
    }

    getDefinition(): AuthenticableUserModelAttributes {
        return {
            [BASE_USER_ATTRIBUTES.ID]: '',
            [BASE_USER_ATTRIBUTES.EMAIL]: '',
            [BASE_USER_ATTRIBUTES.HASHED_PASSWORD]: '',
            [BASE_USER_ATTRIBUTES.ACL_ROLES]: [],
            [BASE_USER_ATTRIBUTES.ACL_GROUPS]: []
        } as AuthenticableUserModelAttributes;
    }
}

export default AuthenticableUserFactory;