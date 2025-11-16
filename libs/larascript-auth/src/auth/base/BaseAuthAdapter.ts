import { IAsyncSessionService } from "@larascript-framework/async-session";
import { IAuthAdapter, IAuthService, IUserModel } from "@larascript-framework/contracts/auth";
import { IBasicACLService } from "@larascript-framework/larascript-acl";

/**
 * Base authentication adapter class that implements the IAuthAdapter interface.
 * Provides core functionality for authentication adapters.
 * @template Config - The configuration type that extends IBaseAuthConfig
 */
export abstract class BaseAuthAdapter<Config extends Record<string, unknown>>
  implements IAuthAdapter<Config>
{
  protected aclService!: IBasicACLService;
  
  protected asyncSession!: IAsyncSessionService;
  
  declare config: Config;
  
  constructor(
    protected readonly authService: IAuthService,
  ) {
    this.aclService = authService.acl();
    this.asyncSession = authService.getAsyncSession();;
  }

  abstract getConfig(): Config;

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
   * Authorize a user
   * @param user
   */
  authorizeUser(user: IUserModel, scopes: string[] = []) {
    this.asyncSession.setSessionData({ userId: user.getId(), scopes });
  }

  /**
   * Logout the user
   */
  logout(): void {
    this.asyncSession.setSessionData({ userId: undefined, scopes: undefined });
  }

  /**
   * Check if the user is authenticated
   * @returns True if the user is authenticated, false otherwise
   */
  async check(): Promise<boolean> {
    return !!this.asyncSession.getSessionData().userId;
  }
}

export default BaseAuthAdapter;
