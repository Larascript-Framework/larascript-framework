import {
  IApiTokenAttributes,
  IApiTokenModel,
  IUserAttributes,
  IUserModel,
} from "./index.js";

export interface IApiTokenRepositoryConstructor {
  new (...args: unknown[]): IApiTokenRepository;
}

export interface IUserRepositoryConstructor {
  new (...args: unknown[]): IUserRepository;
}

export interface IApiTokenRepository {
  create(attributes?: IApiTokenAttributes): Promise<IApiTokenModel>;
  findOneActiveToken(token: string): Promise<IApiTokenModel | null>;
  revokeToken(apiToken: IApiTokenModel): Promise<void>;
  revokeAllTokens(userId: string | number): Promise<void>;
}

export interface IUserRepository {
  create(attributes: IUserAttributes): Promise<IUserModel>;
  findById(id: string | number): Promise<IUserModel | null>;
  findByIdOrFail(id: string | number): Promise<IUserModel>;
  findByEmail(email: string): Promise<IUserModel | null>;
}
