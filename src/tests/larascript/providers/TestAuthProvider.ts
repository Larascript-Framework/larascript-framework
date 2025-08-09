import AuthProvider from "@src/core/domains/auth/providers/AuthProvider";
import AuthConfig from "@src/core/domains/auth/services/AuthConfig";
import JwtAuthService from "@src/core/domains/auth/services/JwtAuthService";
import TestApiTokenModel from "@src/tests/larascript/models/models/TestApiTokenModel";
import TestUser from "@src/tests/larascript/models/models/TestUser";
import TestCreateUserValidator from "@src/tests/larascript/validator/validators/TestCreateUserCustomValidator";
import TestUpdateUserValidator from "@src/tests/larascript/validator/validators/TestUpdateUserValidator";


export default class TestAuthProvider extends AuthProvider {

    protected config = AuthConfig.define([
        AuthConfig.config(JwtAuthService, {
            name: 'jwt',
            models: {
                user: TestUser,
                apiToken: TestApiTokenModel
            },
            validators: {
                createUser: TestCreateUserValidator,
                updateUser: TestUpdateUserValidator
            },
            routes: {
                enabled: true,
                endpoints: {
                    login: true,
                    register: true,
                    update: true,
                    logout: true,
                    refresh: true
                }
            },
            settings: {
                secret: 'test-jwt-secret',
                expiresInMinutes: 60,
            }
        })
    ])

}
