import { IAsyncSessionService } from "@larascript-framework/contracts/async-session";
import { CryptoService, ICryptoService } from "@larascript-framework/crypto-js";
import jwt from "jsonwebtoken";
import BaseAuthAdapter from "../base/BaseAuthAdapter.js";
import { JWTConfigException } from "../exceptions/JWTConfigException.js";
import { JWTSecretException } from "../exceptions/JWTSecretException.js";
import { UnauthorizedException } from "../exceptions/UnauthorizedException.js";
import { JwtFactory } from "../factory/JwtFactory.js";
import { ApiTokenModelOptions, IApiTokenFactory, IApiTokenModel, IApiTokenRepository, IAuthService, IJwtAuthService, IJwtConfig, IOneTimeAuthenticationService, IUserFactory, IUserModel, IUserRepository } from "../interfaces/index.js";
import { createJwt } from "../utils/createJwt.js";
import { decodeJwt } from "../utils/decodeJwt.js";
import { generateToken } from "../utils/generateToken.js";
import OneTimeAuthenticationService from "./OneTimeAuthenticationService.js";

/**
 * JWT-based authentication service that extends BaseAuthAdapter.
 *
 * This service provides JWT token-based authentication functionality including:
 * - User authentication with credentials
 * - JWT token generation and validation
 * - API token management
 * - Password hashing and verification
 * - Token revocation and refresh capabilities
 *
 * @extends BaseAuthAdapter<IJwtConfig>
 * @implements IJwtAuthService
 */
export class JwtAuthService
  extends BaseAuthAdapter<IJwtConfig>
  implements IJwtAuthService
{
  /** One-time authentication service instance */
  protected _oneTimeService = new OneTimeAuthenticationService();

  /** Crypto service for password hashing and verification */
  protected cryptoService!: ICryptoService;

  /** JWT configuration */
  declare config: IJwtConfig;

  /** API token repository */
  protected apiTokenRepository!: IApiTokenRepository;

  /** User repository */
  protected userRepository!: IUserRepository;

  /**
   * Creates a new JwtAuthService instance.
   *
   * @param config - JWT configuration options
   * @param aclService - Access control list service for role and permission management
   */
  constructor(authService: IAuthService) {
    super(authService);
    this.config = authService.getConfig().drivers.jwt;
    this.cryptoService = new CryptoService({
      secretKey: this.config.options.secret,
    });
    this._oneTimeService.setAuthService(authService);
    this.userRepository = new this.config.options.repository.user();
    this.apiTokenRepository = new this.config.options.repository.apiToken();
  }

  /**
   * Gets the async session service.
   *
   * @returns The async session service
   */
  getAsyncSession(): IAsyncSessionService {
    if (!this.asyncSession) {
      throw new Error("asyncSession is not set");
    }

    return this.asyncSession;
  }

  /**
   * Gets the current JWT configuration.
   *
   * @returns The JWT configuration object
   */
  public getConfig(): IJwtConfig {
    return this.config;
  }

  /**
   * Gets the one-time authentication service instance.
   *
   * @returns The one-time authentication service
   */
  public oneTimeService(): IOneTimeAuthenticationService {
    return this._oneTimeService;
  }

  /**
   * Gets the JWT secret key from configuration.
   *
   * @returns The JWT secret key
   * @throws {JWTSecretException} When the JWT secret is not configured
   */
  private getJwtSecret(): string {
    if (!this.config.options.secret) {
      throw new JWTSecretException();
    }
    return this.config.options.secret;
  }

  /**
   * Gets the JWT expiration time in minutes from configuration.
   *
   * @returns The JWT expiration time in minutes
   * @throws {JWTConfigException} When the JWT expiration time is not configured
   */
  private getJwtExpiresInMinutes(): number {
    if (!this.config.options.expiresInMinutes) {
      throw new JWTConfigException();
    }
    return this.config.options.expiresInMinutes;
  }

  /**
   * Attempts to authenticate a user with email and password credentials.
   *
   * This method:
   * 1. Finds the user by email
   * 2. Verifies the password hash
   * 3. Creates an API token with specified scopes
   * 4. Generates and returns a JWT token
   *
   * @param email - User's email address
   * @param password - User's plain text password
   * @param scopes - Additional scopes to assign to the token (defaults to empty array)
   * @param options - Optional API token configuration options
   * @returns A JWT token string for the authenticated user
   * @throws {UnauthorizedException} When authentication fails (invalid credentials, user not found, etc.)
   */
  async attemptCredentials(
    email: string,
    password: string,
    scopes: string[] = [],
    options?: ApiTokenModelOptions,
  ): Promise<string> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException();
    }

    const hashedPassword = user.getHashedPassword();

    if (!hashedPassword) {
      throw new UnauthorizedException();
    }

    if (!this.cryptoService.verifyHash(password, hashedPassword)) {
      throw new UnauthorizedException();
    }

    // Merge options with the default options
    options = {
      expiresAfterMinutes: options?.expiresAfterMinutes ?? this.getJwtExpiresInMinutes(),
      ...options,
    }

    // Generate the api token
    const apiToken = await this.buildApiTokenByUser(
      user,
      scopes,
      options ?? {},
    );

    // Save
    await this.apiTokenRepository.create({
      userId: user.getId(),
      token: apiToken.getToken(),
      scopes: apiToken.getScopes(),
      options: apiToken.getOptions() ?? {},
      revokedAt: apiToken.getRevokedAt(),
      expiresAt: apiToken.getExpiresAt(),
    });

    // Generate the JWT token
    return this.generateJwt(apiToken);
  }

  /**
   * Creates a new API token model for a given user.
   *
   * This method combines the user's role scopes with any additional scopes provided
   * and creates an API token with the specified options.
   *
   * @param user - The user model to create the token for
   * @param scopes - Additional scopes to assign to the token (defaults to empty array)
   * @param options - API token configuration options (defaults to empty object)
   * @returns A new API token model instance:
   */
  async buildApiTokenByUser(
    user: IUserModel,
    scopes: string[] = [],
    options: ApiTokenModelOptions = {},
  ): Promise<IApiTokenModel> {
    const apiToken = new this.config.options.factory.apiToken().create({
      userId: user.getId(),
      token: generateToken(),
      scopes: [...this.aclService.getRoleScopesFromUser(user), ...scopes],
      revokedAt: null,
      options: options,
    });

    if (options?.expiresAfterMinutes) {
      const expiresAt = new Date(
        Date.now() + options.expiresAfterMinutes * 60 * 1000,
      );
      await apiToken.setExpiresAt(expiresAt);
    }

    return apiToken;
  }

  async addGroupScopes(data: IApiTokenModel): Promise<IApiTokenModel> {
    const user = await this.userRepository.findByIdOrFail(data.getUserId())

    if(!user) {
        throw new Error("User not found")
    }

    const userGroups = user.getAclGroups() ?? []

    for(const userGroup of userGroups) {
        const scopes = this.aclService.getGroupScopes(userGroup)
        await data.setScopes([
            ...data.getScopes(),
            ...scopes
        ])
    }

    return data
}

  /**
   * Generates a JWT token from an API token model.
   *
   * @param apiToken - The API token model to generate JWT from
   * @returns A JWT token string
   * @throws {Error} When the API token is invalid or missing user ID
   */
  protected generateJwt(apiToken: IApiTokenModel) {
    if (!apiToken?.getUserId()) {
      throw new Error("Invalid token");
    }

    // Create the payload
    const payload = JwtFactory.createUserIdAndPayload(
      apiToken.getUserId(),
      apiToken.getToken(),
    );

    // Get the expires in minutes. Example: 1m
    const expiresIn = `${this.getJwtExpiresInMinutes()}m`;

    // Create the JWT token
    return createJwt(this.getJwtSecret(), payload, expiresIn);
  }

  /**
   * Attempts to authenticate a user using a JWT token.
   *
   * This method:
   * 1. Decodes and validates the JWT token
   * 2. Finds the corresponding API token in the database
   * 3. Verifies the user exists and token hasn't expired
   *
   * @param token - The JWT token to authenticate
   * @returns The API token model if authentication succeeds, null otherwise
   * @throws {UnauthorizedException} When authentication fails (invalid token, expired token, user not found, etc.)
   */
  async attemptAuthenticateToken(
    token: string,
  ): Promise<IApiTokenModel | null> {
    try {
      const { token: decodedToken, uid: decodedUserId } = decodeJwt(
        this.getJwtSecret(),
        token,
      );

      const apiToken =
        await this.apiTokenRepository.findOneActiveToken(decodedToken);

      if (!apiToken) {
        throw new UnauthorizedException();
      }

      const user = await this.userRepository.findById(decodedUserId);

      if (!user) {
        throw new UnauthorizedException();
      }

      if (apiToken.hasExpired()) {
        throw new UnauthorizedException();
      }

      return apiToken;
    } catch (err) {
      if (err instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedException();
      }
    }

    return null;
  }

  /**
   * Creates a JWT token directly from a user model.
   *
   * This method bypasses credential verification and creates a token
   * for an already authenticated user.
   *
   * @param user - The user model to create the token for
   * @param scopes - Additional scopes to assign to the token (defaults to empty array)
   * @param options - API token configuration options (defaults to empty object)
   * @returns A JWT token string
   */
  public async createJwtFromUser(
    user: IUserModel,
    scopes: string[] = [],
    options: ApiTokenModelOptions = {},
  ): Promise<string> {
    const apiToken = await this.buildApiTokenByUser(user, scopes, options);

    await this.apiTokenRepository.create({
      userId: user.getId(),
      token: apiToken.getToken(),
      scopes: apiToken.getScopes(),
      options: apiToken.getOptions() ?? {},
      revokedAt: apiToken.getRevokedAt(),
      expiresAt: apiToken.getExpiresAt(),
    });

    return this.generateJwt(apiToken);
  }

  /**
   * Refreshes a JWT token using an existing API token.
   *
   * @param apiToken - The API token model to refresh
   * @returns A new JWT token string
   */
  refreshToken(apiToken: IApiTokenModel): string {
    return this.generateJwt(apiToken);
  }

  /**
   * Revokes an API token by setting its revoked timestamp.
   *
   * If the token is already revoked, this method does nothing.
   *
   * @param apiToken - The API token model to revoke
   * @returns Promise that resolves when the token is revoked
   */
  async revokeToken(apiToken: IApiTokenModel): Promise<void> {
    if (apiToken?.getRevokedAt()) {
      return;
    }

    await this.apiTokenRepository.revokeToken(apiToken);
  }

  /**
   * Revokes all API tokens for a specific user.
   *
   * @param userId - The user ID whose tokens should be revoked
   * @returns Promise that resolves when all tokens are revoked
   */
  async revokeAllTokens(userId: string | number): Promise<void> {
    await this.apiTokenRepository.revokeAllTokens(userId);
  }

  /**
   * Gets the user repository instance.
   *
   * @returns The user repository for data operations
   */
  getUserRepository(): IUserRepository {
    return this.userRepository;
  }

  /**
   * Gets the API token repository instance.
   *
   * @returns The API token repository for data operations
   */
  getApiTokenRepository(): IApiTokenRepository {
    return this.apiTokenRepository;
  }

  /**
   * Gets the user factory instance.
   *
   * @returns The user factory for creating user models
   */
  getUserFactory(): IUserFactory {
    return new this.config.options.factory.user();
  }

  /**
   * Gets the API token factory instance.
   *
   * @returns The API token factory for creating API token models
   */
  getApiTokenFactory(): IApiTokenFactory {
    return new this.config.options.factory.apiToken();
  }

  /**
   * Gets the currently authenticated user from the session.
   *
   * @returns The current user model or null if not authenticated
   */
  async user(): Promise<IUserModel | null> {
    if (!(await this.check())) {
      return null;
    }

    return await this.userRepository.findById(
      this.asyncSession.getSessionData().userId as string,
    );
  }

  /**
   * Hashes a plain text password using the crypto service.
   *
   * @param password - The plain text password to hash
   * @returns A hashed password string
   */
  async hashPassword(password: string): Promise<string> {
    return await this.cryptoService.hash(password);
  }
}

export default JwtAuthService;
