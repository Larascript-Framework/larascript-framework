import { AuthenticableUserModelAttributes, IAuthenticableUserModel, IUserFactory } from "@larascript-framework/contracts/auth";
import { BaseModelFactory, ModelConstructor } from "@larascript-framework/larascript-database";
import { USER_ATTRIBUTES } from "../consts/UserAttributes.js";

export class AuthenticableUserFactory<T extends IAuthenticableUserModel = IAuthenticableUserModel> extends BaseModelFactory<T> implements IUserFactory {

    constructor(modelConstructor: ModelConstructor<T>) {
        super(modelConstructor);
    }

    getDefinition(): AuthenticableUserModelAttributes {
        return {
            [USER_ATTRIBUTES.ID]: '',
            [USER_ATTRIBUTES.EMAIL]: '',
            [USER_ATTRIBUTES.HASHED_PASSWORD]: '',
            [USER_ATTRIBUTES.ACL_ROLES]: [],
            [USER_ATTRIBUTES.ACL_GROUPS]: []
        } as AuthenticableUserModelAttributes;
    }
}

export default AuthenticableUserFactory;