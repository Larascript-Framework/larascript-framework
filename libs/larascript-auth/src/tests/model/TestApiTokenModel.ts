import { BasicACLScope } from "@larascript-framework/larascript-acl";
import {
  BaseModel,
  BaseModelAttributes,
} from "@larascript-framework/test-helpers";
import { ApiTokenModelOptions, IApiTokenModel } from "../../auth/index.js";

export interface ITestApiTokenAttributes extends BaseModelAttributes {
  id: string;
  token: string;
  userId: string;
  scopes: string[];
  options: Record<string, unknown>;
  expiresAt: Date | null;
  revokedAt: Date | null;
}

export class TestApiTokenModel
  extends BaseModel<ITestApiTokenAttributes>
  implements IApiTokenModel
{
  getUserId(): string {
    return this.attributes.userId;
  }

  async setUserId(userId: string): Promise<void> {
    this.attributes.userId = userId;
  }

  getToken(): string {
    return this.attributes.token;
  }

  async setToken(token: string): Promise<void> {
    this.attributes.token = token;
  }

  getScopes(): string[] {
    return this.attributes.scopes;
  }

  async setScopes(scopes: string[]): Promise<void> {
    this.attributes.scopes = scopes;
  }

  hasScope(scopes: string | string[], exactMatch?: boolean): boolean {
    if (exactMatch) {
      return BasicACLScope.exactMatch(this.attributes.scopes, scopes);
    }
    return BasicACLScope.partialMatch(this.attributes.scopes, scopes);
  }

  getRevokedAt(): Date | null {
    return this.attributes.revokedAt;
  }

  async setRevokedAt(revokedAt: Date | null): Promise<void> {
    this.attributes.revokedAt = revokedAt;
  }

  async setOptions(options: Record<string, unknown>): Promise<void> {
    this.attributes.options = options;
  }

  getOptions<T extends ApiTokenModelOptions>(): T | null {
    return this.attributes.options as T | null;
  }

  async setExpiresAt(expiresAt: Date): Promise<void> {
    this.attributes.expiresAt = expiresAt;
  }

  getExpiresAt(): Date | null {
    return this.attributes.expiresAt;
  }

  hasExpired(): boolean {
    if (!this.attributes.expiresAt) {
      return false;
    }
    return this.attributes.expiresAt.getTime() < new Date().getTime();
  }
}
