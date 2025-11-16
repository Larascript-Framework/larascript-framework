import { BaseAdapterTypes } from "@larascript-framework/larascript-core";
import { IJwtAuthService } from "./jwt.t.js";
import { IUserModel } from "./models.t.js";

export type BaseAuthAdapterTypes = BaseAdapterTypes<IAuthAdapter> & {
  jwt: IJwtAuthService;
};

export interface AuthAdapterConstructor<T extends IAuthAdapter = IAuthAdapter> {
  new (config: ReturnType<T["getConfig"]>, ...args: unknown[]): T;
}

export interface IAuthAdapter<
  Config extends Record<string, unknown> = Record<string, unknown>,
> {
  boot(): Promise<void>;
  getConfig(): Config;
  authorizeUser(user: IUserModel): void;
  user(): Promise<IUserModel | null>;
  check(): Promise<boolean>;
}
