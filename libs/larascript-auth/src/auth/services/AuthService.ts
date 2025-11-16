import { IAsyncSessionService } from "@larascript-framework/async-session";
import {
  BaseAuthAdapterTypes,
  IApiTokenFactory,
  IApiTokenRepository,
  IAuthConfig,
  IAuthService,
  IJwtAuthService,
  IUserFactory,
  IUserModel,
  IUserRepository,
} from "@larascript-framework/contracts/auth";
import {
  BasicACLService,
  IAclConfig,
  IBasicACLService,
} from "@larascript-framework/larascript-acl";
import { BaseAdapter } from "@larascript-framework/larascript-core";
import JwtAuthService from "./JwtAuthService.js";

/**
 * AuthService provides authentication and authorization services,
 * including management of authentication adapters and integration with ACL.
 *
 * @class Auth
 * @extends BaseAdapter<BaseAuthAdapterTypes>
 * @implements IAuthService
 *
 * @param {IAuthConfig} config - The authentication configuration, including available drivers.
 * @param {IAclConfig} aclConfig - The ACL configuration.
 *
 * @property {IBasicACLService} aclService - The ACL service instance.
 *
 * @method setAclService - Sets the ACL service instance.
 * @method acl - Returns the current ACL service instance.
 * @method boot - Boots the authentication service and its adapters.
 * @method getJwt - Returns the JWT authentication adapter.
 * @method check - Checks if the current user is authenticated.
 * @method user - Returns the currently authenticated user, if any.
 * @method getUserRepository - Returns the user repository.
 *
 * @protected
 * @method registerAdapters - Registers authentication adapters from the config.
 * @method bootAdapters - Boots all registered adapters.
 */

export class AuthService
  extends BaseAdapter<BaseAuthAdapterTypes>
  implements IAuthService
{
  public static readonly JWT_ADAPTER_NAME = "jwt";

  protected aclService!: IBasicACLService;

  constructor(
    protected readonly config: IAuthConfig,
    protected readonly aclConfig: IAclConfig,
    protected readonly asyncSession: IAsyncSessionService,
  ) {
    super();
    this.setAclService(new BasicACLService(this.aclConfig));
  }

  getApiTokenFactory(): IApiTokenFactory {
    return new this.config.drivers.jwt.options.factory.apiToken();
  }

  getAsyncSession(): IAsyncSessionService {
    return this.asyncSession;
  }

  /**
   * Sets the ACL service
   * @param aclService - The ACL service
   */
  setAclService(aclService: IBasicACLService): void {
    this.aclService = aclService;
  }

  /**
   * Boots the auth service
   * @returns A promise that resolves when the auth service is booted
   */
  public async boot(): Promise<void> {
    this.addAdapterOnce(
      AuthService.JWT_ADAPTER_NAME,
      new JwtAuthService(
        this
      ),
    );

    for (const adapterInstance of Object.values(this.adapters)) {
      await adapterInstance.boot();
    }
  }

  public getConfig(): IAuthConfig {
    return this.config;
  }

  /**
   * Get the JWT adapter
   * @returns The JWT adapter
   */
  public getJwt(): IJwtAuthService {
    return this.getAdapter(AuthService.JWT_ADAPTER_NAME) as IJwtAuthService;
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
    return await this.getJwt().check();
  }

  /**
   * Get the user
   * @returns The user
   */
  public async user(): Promise<IUserModel | null> {
    return await this.getJwt().user();
  }

  /**
   * Get the user repository
   * @returns The user repository
   */
  public getUserRepository(): IUserRepository {
    return this.getJwt().getUserRepository();
  }

  /**
   * Get the api token repository
   * @returns The api token repository
   */
  public getApiTokenRepository(): IApiTokenRepository {
    return this.getJwt().getApiTokenRepository();
  }

  /**
   * Get the user factory
   * @returns The user factory
   */
  public getUserFactory(): IUserFactory {
    return this.getJwt().getUserFactory();
  }
}

export default AuthService;
