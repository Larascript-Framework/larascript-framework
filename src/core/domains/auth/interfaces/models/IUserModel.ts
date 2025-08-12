/* eslint-disable no-unused-vars */
import { IAccessControlEntity } from "@ben-shepherd/larascript-acl-bundle";
import { IModel, ModelConstructor } from "@src/core/domains/models/interfaces/IModel";

export interface UserConstructor<TUser extends IUserModel = IUserModel> extends ModelConstructor<TUser> {}

export interface IUserModel extends IModel, IAccessControlEntity {
    getEmail(): string | null;
    setEmail(email: string): Promise<void>;
    getHashedPassword(): string | null;
    setHashedPassword(hashedPassword: string): Promise<void>;
    hasRole(role: string | string[]): boolean;
}
