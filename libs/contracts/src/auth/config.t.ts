import { TClassConstructor } from "../core/constructor.js";
import { IValidator } from "../validator/IValidator.js";
import { IAuthAdapter } from "./adapter.t.js";
import { IJwtConfig } from "./jwt.t.js";

export interface IAuthRoutesConfig {
  routes: {
      enabled: boolean,
      endpoints: {
          register: boolean,
          login: boolean,
          refresh: boolean,
          update: boolean,
          logout: boolean
      }
  },
}

export type IAuthRoutesValidatorsConfig = {
  validators?: {
    user?: {
      create?: TClassConstructor<IValidator>;
      update?: TClassConstructor<IValidator>;
      delete?: TClassConstructor<IValidator>;
    }
  }
}

export interface IBaseDriverConfig<Adapter extends IAuthAdapter = IAuthAdapter>
  extends Record<string, unknown> {
  name: string;
  options: ReturnType<Adapter["getConfig"]>["options"];
}

export interface IAuthConfig {
  drivers: Record<string, IBaseDriverConfig> & {
    jwt: IJwtConfig;
  };
}

export type IAuthRoutesConfigExtended = IAuthConfig & IAuthRoutesConfig & IAuthRoutesValidatorsConfig;