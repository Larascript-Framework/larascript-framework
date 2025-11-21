import UserFactory from '@/app/factory/UserFactory.js';
import UserRepository from '@/app/repositories/UserRepository.js';
import CreateUserValidator from '@/app/validators/user/CreateUserValidator.js';
import UpdateUserValidator from '@/app/validators/user/UpdateUserValidator.js';
import { IAuthRoutesConfigExtended } from '@larascript-framework/contracts/auth';
import { ApiTokenFactory, ApiTokenRepository } from '@larascript-framework/larascript-auth';
import { parseBooleanFromString } from '@larascript-framework/larascript-utils';

export const authConfig: IAuthRoutesConfigExtended = {
    drivers: {
        jwt: {
            name: 'jwt',
            options: {
                secret: process.env.JWT_SECRET as string ?? '',
                expiresInMinutes: process.env.JWT_EXPIRES_IN_MINUTES ? parseInt(process.env.JWT_EXPIRES_IN_MINUTES) : 60,
                factory: {
                    user: UserFactory,
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
        enabled: parseBooleanFromString(process.env.ENABLE_AUTH_ROUTES, 'true'),
        endpoints: {
            register: true,
            login: true,
            refresh: true,
            update: true,
            logout: true
        } 
    },
    validators: {
        user: {
            create: CreateUserValidator,
            update: UpdateUserValidator
        }
    }
}
