import { IAuthConfig } from "@larascript-framework/contracts/auth";
import ApiTokenFactory from "../factory/ApiTokenFactory.js";
import UserFactory from "../factory/UserFactory.js";
import ApiTokenRepository from "../repository/ApiTokenRepository.js";
import UserRepository from "../repository/UserRepository.js";

export const authConfig: IAuthConfig = {
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
    }
}