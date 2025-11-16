import { IFactory } from "@larascript-framework/contracts/larascript-core";
import { generateUuidV4 } from "@larascript-framework/larascript-utils";
import { IApiTokenAttributes, IApiTokenModel } from "../../auth/index.js";
import { TestApiTokenModel } from "../model/TestApiTokenModel.js";

export class TestApiTokenFactory implements IFactory<IApiTokenModel> {
  getDefinition(): unknown {
    return {};
  }

  create(attributes?: IApiTokenAttributes): IApiTokenModel {
    return new TestApiTokenModel({
      id: attributes?.id ?? generateUuidV4(),
      token: attributes?.token ?? "",
      userId: attributes?.userId ?? "",
      scopes: attributes?.scopes ?? [],
      options: attributes?.options ?? {},
      expiresAt: attributes?.expiresAt ?? null,
      revokedAt: attributes?.revokedAt ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}
