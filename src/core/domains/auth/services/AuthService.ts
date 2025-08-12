import { IBasicACLService } from "@ben-shepherd/larascript-acl";
import { BaseAdapter, DependencyLoader, RequiresDependency } from "@ben-shepherd/larascript-core";
import { AuthAdapters } from "@src/config/auth.config";
import { Providers } from "@src/config/providers.config";
import { IBaseAuthConfig } from "@src/core/domains/auth/interfaces/config/IAuth";
import { IUserModel } from "@src/core/domains/auth/interfaces/models/IUserModel";
import { IUserRepository } from "@src/core/domains/auth/interfaces/repository/IUserRepository";
import { IAuthService } from "@src/core/domains/auth/interfaces/service/IAuthService";
import { app } from "@src/core/services/App";

/**
 * Short hand for app('auth')
 */
export const auth = () => app('auth');

/**
 * Auth Service
 * 
 * This is the main authentication service that manages different authentication adapters
 * (like JWT, Session etc) and integrates with ACL (Access Control List).
 * 
 * Key responsibilities:
 * - Manages multiple authentication adapters (JWT by default)
 * - Integrates with ACL service for role/permission management
 * - Provides helper methods to access default and specific adapters
 * - Handles adapter registration and initialization
 * 
 * The service works with:
 * - AuthAdapters: Different authentication implementations (JWT etc)
 * - ACLService: For managing roles and permissions
 * - IBaseAuthConfig: Configuration for each auth adapter
 * 
 * Usage:
 * - Use auth() helper to access the service
 * - Use acl() helper to access ACL functionality
 */

class Auth extends BaseAdapter<AuthAdapters> implements IAuthService, RequiresDependency {

    private config!: IBaseAuthConfig[];

    private aclService!: IBasicACLService;

    constructor(config: IBaseAuthConfig[]) {
        super();
        this.config = config;
    }

    setDepdencyLoader(loader: DependencyLoader): void {
        this.aclService = loader<Providers, "acl.basic">("acl.basic")
    }

    /**
     * Get the default adapter
     * @returns The default adapter
     */
    public getDefaultAdapter(): AuthAdapters['default'] {
        return this.getAdapter('jwt') as AuthAdapters['default'];
    }

    /**
     * Get the JWT adapter
     * @returns The JWT adapter
     */
    public getJwtAdapter(): AuthAdapters['jwt'] {
        return this.getAdapter('jwt') as AuthAdapters['jwt'];
    }

    /**
     * Boots the auth service
     * @returns A promise that resolves when the auth service is booted
     */
    public async boot(): Promise<void> {
        await this.registerAdapters();
        await this.bootAdapters();
    }

    /**
     * Registers the adapters
     */
    protected registerAdapters(): void {
        const aclConfig = this.aclService.getConfig();

        for(const adapter of this.config) {
            const adapterInstance = new adapter.adapter(adapter, aclConfig);
            this.addAdapterOnce(adapter.name, adapterInstance);
        }

    }

    /**
     * Boots the adapters
     */
    protected async bootAdapters(): Promise<void> {
        for(const adapterInstance of Object.values(this.adapters)) {
            await adapterInstance.boot();
        }
    }

    /**
     * Get the ACL service
     * @returns The ACL service
     */
    public acl(): IBasicACLService {
        return this.aclService;
    }
    
    /**
     * Check if the user is authenticated
     * @returns True if the user is authenticated, false otherwise
     */
    public async check(): Promise<boolean> {
        return await this.getDefaultAdapter().check();
    }

    /**
     * Get the user
     * @returns The user
     */
    public async user(): Promise<IUserModel | null> {
        return await this.getDefaultAdapter().user();
    }

    /**
     * Get the user repository
     * @returns The user repository
     */
    public getUserRepository(): IUserRepository {
        return this.getDefaultAdapter().getUserRepository()
    }

        
}

export default Auth;