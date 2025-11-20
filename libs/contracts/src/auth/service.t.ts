import { IBasicACLService } from "@/acl/acl.js";
import { IAsyncSessionService } from "@larascript-framework/async-session";
import { IApiTokenFactory, IUserFactory } from "./factory.js";
import { IApiTokenRepository, IAuthConfig, IJwtAuthService, IUserRepository } from "./index.js";
import { ApiTokenModelOptions, IApiTokenModel, IAuthenticableUserModel, IUserCreationAttributes, IUserModel } from "./models.t.js";

export interface IAuthService {
  getConfig(): IAuthConfig;
  getAsyncSession(): IAsyncSessionService;
  setAclService(aclService: IBasicACLService): void;
  acl(): IBasicACLService;
  boot(): Promise<void>;
  getJwt(): IJwtAuthService;
  check(): Promise<boolean>;
  user(): Promise<IUserModel | null>;
  getUserRepository(): IUserRepository;
  getUserFactory(): IUserFactory;
  getApiTokenRepository(): IApiTokenRepository;
  getApiTokenFactory(): IApiTokenFactory;
}

export type SingleUseTokenOptions = Required<
  Pick<ApiTokenModelOptions, "expiresAfterMinutes">
>;

export interface IOneTimeAuthenticationService {
  setAuthService(authService: IAuthService): void;
  getScope(): string;
  createSingleUseToken(
    user: IUserModel,
    scopes?: string[],
    options?: SingleUseTokenOptions,
  ): Promise<string>;
  validateSingleUseToken(apiToken: IApiTokenModel): boolean;
}

export type IUserCreationServiceUpdateModelOptions = {
  RequirePassword: boolean;
}

export interface IUserCreationService {
  create(attributes: IUserCreationAttributes): Promise<IAuthenticableUserModel>;
  createAndSave(attributes: IUserCreationAttributes): Promise<IAuthenticableUserModel>;
  updateModel(model: IAuthenticableUserModel): Promise<IAuthenticableUserModel>;
  updateAttributes(attributes: IUserCreationAttributes, updateOptions?: IUserCreationServiceUpdateModelOptions): Promise<IUserCreationAttributes>;
}
