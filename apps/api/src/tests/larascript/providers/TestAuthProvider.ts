import UserRepository from "@/app/repositories/UserRepository.js";
import { GROUPS, ROLES } from "@/config/acl.config.js";
import AuthProvider from "@/core/providers/AuthProvider.js";
import { IAuthRoutesConfigExtended } from "@larascript-framework/contracts/auth";
import { IAclConfig } from "@larascript-framework/larascript-acl";
import { ApiTokenFactory, ApiTokenRepository, AuthenticableUserFactory } from "@larascript-framework/larascript-auth";


export default class TestAuthProvider extends AuthProvider {

    protected config: IAuthRoutesConfigExtended = {
        drivers: {
            jwt: {
                name: 'jwt',
                options: {
                    secret: 'test-secret',
                    expiresInMinutes: 60,
                    factory: {
                        user: AuthenticableUserFactory,
                        apiToken: ApiTokenFactory
                    },
                    repository: {
                        user: UserRepository,
                        apiToken: ApiTokenRepository
                    }
                }
            }
        },
        routes: {
            enabled: true,
            endpoints: {
                register: true,
                login: true,
                refresh: true,
                update: true,
                logout: true
            } 
        }
    }

    protected aclConfig: IAclConfig = {

        // Default user group
        defaultGroup: GROUPS.USER,
    
        // List of groups
        groups: [
            {
                name: GROUPS.USER,
                roles: [ROLES.USER]
            },
            {
                name: GROUPS.ADMIN,
                roles: [ROLES.USER, ROLES.ADMIN]
            }
        ],
    
        // List of roles, scopes and other permissions
        roles: [
            {
                name: ROLES.ADMIN,
                scopes: []
            },
            {
                name: ROLES.USER,
                scopes: []
            },
        ],
    
    }
    
}
