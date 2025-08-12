import { IAclConfig } from "@src/core/domains/auth/interfaces/acl/IAclConfig";
import { IAuthAdapter } from "@src/core/domains/auth/interfaces/adapter/IAuthAdapter";
import { IBaseAuthConfig } from "@src/core/domains/auth/interfaces/config/IAuth";
import { IUserModel } from "@src/core/domains/auth/interfaces/models/IUserModel";
import { IRouter } from "@src/core/domains/http/interfaces/IRouter";
import Router from "@src/core/domains/http/router/Router";
import { asyncSession } from "@src/core/services/AsyncSession";

/**
 * Base authentication adapter class that implements the IAuthAdapter interface.
 * Provides core functionality for authentication adapters.
 * @template Config - The configuration type that extends IBaseAuthConfig
 */
abstract class BaseAuthAdapter<Config extends IBaseAuthConfig> implements IAuthAdapter<Config> {

    public config!: Config;

    protected aclConfig!: IAclConfig
    
    constructor(config: Config, aclConfig: IAclConfig) {
        this.config = config;
        this.aclConfig = aclConfig;
    }
    
    /**
     * Get the user
     * @returns The user
     */
    abstract user(): Promise<IUserModel | null>;

    /**
     * Check if the user is authenticated
    abstract check(): Promise<boolean>;

    /**
     * Boots the adapter
     * @returns A promise that resolves when the adapter is booted
     */
    public async boot(): Promise<void> {
        return Promise.resolve();
    }


    /**
     * Retrieves the current configuration
     * @returns The current configuration object
     */

    getConfig(): Config {
        return this.config;
    }

    /**
     * Updates the configuration
     * @param config - The new configuration object to set
     */
    setConfig(config: Config): void {
        this.config = config;
    }

    /**
     * Creates and returns a new router instance
     * @returns A new IRouter instance
     */
    getRouter(): IRouter {
        return new Router();
    }

    /**
     * Authorize a user
     * @param user 
     */
    authorizeUser(user: IUserModel) {
        asyncSession().setSessionData({ userId: user.getId() })
    }

    /**
     * Check if the user is authenticated
     * @returns True if the user is authenticated, false otherwise
     */
    async check(): Promise<boolean> {
        return !!asyncSession().getSessionData().userId
    }


}

export default BaseAuthAdapter;

