import { IFactory } from "@/core/base.js";
import { IJSonWebToken } from "./jwt.t.js";
import { IApiTokenModel, IUserModel } from "./models.t.js";

export interface IUserFactoryConstructor {
  new (...args: any[]): IUserFactory;
}

export interface IApiTokenFactoryConstructor {
  new (...args: any[]): IApiTokenFactory;
}

export type IUserFactory = IFactory<IUserModel>;

export type IApiTokenFactory = IFactory<IApiTokenModel>;

export type IJwtFactory = IFactory<IJSonWebToken>;
