import { aclConfig, authConfig } from "@/auth/index.js";
import { AsyncSessionService } from "@larascript-framework/async-session";
import { IAuthEnvironmentConfig } from "@larascript-framework/contracts/auth";
import { EnvironmentTesting } from "@larascript-framework/larascript-core";

export const testEnvironmentConfig: IAuthEnvironmentConfig = {
    environment: EnvironmentTesting,
    authConfig: {
        ...authConfig,
        drivers: {
            jwt: {
                ...authConfig.drivers.jwt,
                options: {
                    ...authConfig.drivers.jwt.options,
                    secret: 'test',
                    expiresInMinutes: 60 * 24, // 24 hours
                }
            }
        }
    },
    routesConfig: {
        routes: {
            enabled: true,
            endpoints: {
                login: true,
                register: true,
                refresh: true,
                update: true,
                logout: true
            }
        }
    },
    aclConfig: aclConfig,
    secretKey: 'test',
    dependencies: {
        asyncSessionService: AsyncSessionService.getInstance(),
    },
    dropAndCreateTables: true,
    boot: true,
}