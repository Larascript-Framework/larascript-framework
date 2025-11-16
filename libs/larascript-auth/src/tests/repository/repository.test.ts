import { beforeEach, describe, expect, test } from "@jest/globals";
import { IApiTokenModel, IUserModel } from "@larascript-framework/contracts/auth";
import TestUserModel from "../model/TestUserModel.js";
import { InMemoryApiTokenRepository } from "./InMemoryApiTokenRepository.js";
import { InMemoryUserRepository } from "./InMemoryUserRepository.js";

describe("Repository", () => {
  let userRepository: InMemoryUserRepository;
  let apiTokenRepository: InMemoryApiTokenRepository;
  let user: IUserModel;
  let apiToken: IApiTokenModel;

  beforeEach(async () => {
    userRepository = new InMemoryUserRepository();
    apiTokenRepository = new InMemoryApiTokenRepository();

    user = await userRepository.create({
      id: "1",
      email: "test@test.com",
      hashedPassword: "password",
      aclRoles: [],
      aclGroups: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    apiToken = await apiTokenRepository.create({
      id: "1",
      userId: "1",
      token: "token",
      scopes: [],
      options: {},
      revokedAt: null,
      expiresAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });

  describe("base", () => {
    test("should update a item", async () => {
      await userRepository.update("id", "1", { email: "test2@test.com" });

      const user = (
        await userRepository.getRecords()
      )[0] as unknown as IUserModel;

      expect(user.getEmail()).toBe("test2@test.com");
    });

    test("should delete a item", async () => {
      await userRepository.delete("id", "1");
      expect((await userRepository.getRecords()).length).toBe(0);
    });

    test("should set data", async () => {
      await userRepository.setRecords([
        new TestUserModel({
          id: "2",
          email: "test2@test.com",
          hashedPassword: "password2",
          aclRoles: [],
          aclGroups: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      ]);
      expect((await userRepository.getRecords()).length).toBe(1);
      expect((await userRepository.getRecords())[0].getEmail()).toBe(
        "test2@test.com",
      );
    });

    describe("user", () => {
      test("should return a user by id", async () => {
        const foundUser = await userRepository.findById(user.getId());

        expect(foundUser).toBeDefined();
        expect(foundUser?.getEmail()).toBe("test@test.com");
        expect(foundUser?.getHashedPassword()).toBe("password");
      });

      test("should return a user by email", async () => {
        const foundUser = await userRepository.findByEmail(
          user.getEmail() as string,
        );

        expect(foundUser).toBeDefined();
        expect(foundUser?.getEmail()).toBe("test@test.com");
        expect(foundUser?.getHashedPassword()).toBe("password");
      });

      test("should throw an error if user is not found", async () => {
        await expect(userRepository.findByIdOrFail("not-found")).rejects.toThrow(
          "User not found",
        );
      });
    });

    describe("apiToken", () => {
      test("should return a api token by token", async () => {
        const foundApiToken = await apiTokenRepository.findOneActiveToken(
          apiToken.getToken(),
        );

        expect(foundApiToken).toBeDefined();
        expect(foundApiToken?.getToken()).toBe("token");
        expect(foundApiToken?.getUserId()).toBe("1");
        expect(foundApiToken?.getScopes()).toEqual([]);
        expect(foundApiToken?.getOptions()).toEqual({});
      });

      test("should return null if api token is not found", async () => {
        const foundApiToken =
          await apiTokenRepository.findOneActiveToken("invalid");

        expect(foundApiToken).toBeNull();
      });

      test("expect revokedAt to be a date after revokeToken", async () => {
        await apiTokenRepository.revokeToken(apiToken);

        const foundApiToken = await apiTokenRepository.findOneActiveToken(
          apiToken.getToken(),
        );

        expect(foundApiToken?.getRevokedAt()).not.toBeNull();
      });

      test("should revoke all api tokens for a user", async () => {
        const apiToken2 = await apiTokenRepository.create({
          id: "2",
          userId: "1",
          token: "token2",
          scopes: [],
          options: {},
          revokedAt: null,
          expiresAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        await apiTokenRepository.revokeAllTokens(user.getId());

        const foundApiToken = await apiTokenRepository.findOneActiveToken(
          apiToken.getToken(),
        );
        const foundApiToken2 = await apiTokenRepository.findOneActiveToken(
          apiToken2.getToken(),
        );

        expect(foundApiToken?.getRevokedAt()).not.toBeNull();
        expect(foundApiToken2?.getRevokedAt()).not.toBeNull();
      });
    });
  });
});
