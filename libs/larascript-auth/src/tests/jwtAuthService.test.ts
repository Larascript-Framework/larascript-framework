import { IApiTokenFactory, IUserFactory } from "@/auth/interfaces/index.js";
import { AuthEnvironment } from "@/environment/AuthEnvironment.js";
import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import { AsyncSessionService } from "@larascript-framework/async-session";
import { IAclConfig } from "@larascript-framework/larascript-acl";
import {
  IApiTokenRepository,
  IAuthConfig,
  IJwtAuthService,
  IUserRepository,
} from "../auth/index.js";
import AuthService from "../auth/services/AuthService.js";
import { TestApiTokenFactory } from "./factory/TestApiTokenFactory.js";
import { TestUserFactory } from "./factory/TestUserFactory.js";
import { TestApiTokenModel } from "./model/TestApiTokenModel.js";
import { InMemoryApiTokenRepository } from "./repository/InMemoryApiTokenRepository.js";
import { InMemoryUserRepository } from "./repository/InMemoryUserRepository.js";
import { TestAuthEnvironment } from "./utils/TestAuthEnvironment.js";

const mockAclConfig: IAclConfig = {
  roles: [
    {
      name: "guest",
      scopes: [],
    },
    {
      name: "admin",
      scopes: ["admin:read", "admin:write"],
    },
    {
      name: "user",
      scopes: ["user:read", "user:write"],
    },
  ],
  groups: [
    {
      name: "admin",
      roles: ["admin"],
    },
    {
      name: "user",
      roles: ["user"],
    },
    {
      name: "guest",
      roles: ["guest"],
    },
  ],
  defaultGroup: "user",
};

const mockAuthConfig: IAuthConfig = {
  drivers: {
    jwt: {
      name: "jwt",
      options: {
        secret: "test-secret",
        expiresInMinutes: 60,
        factory: {
          user: TestUserFactory,
          apiToken: TestApiTokenFactory,
        },
        repository: {
          user: InMemoryUserRepository,
          apiToken: InMemoryApiTokenRepository,
        },
      },
    },
  },
};

describe("AuthService", () => {
  let authService: AuthService;
  let userRepository: IUserRepository;
  let apiTokenRepository: IApiTokenRepository;
  let userFactory: IUserFactory;
  let apiTokenFactory: IApiTokenFactory;
  let jwt: IJwtAuthService;
  let asyncSession: AsyncSessionService;

  beforeEach(async () => {
    jest.clearAllMocks();

    await TestAuthEnvironment.create(
      mockAuthConfig,
      mockAclConfig,
    ).boot();

    asyncSession = AsyncSessionService.getInstance();
    
    authService = AuthEnvironment.getInstance().authService as AuthService;

    jwt = authService.getJwt();

    userRepository = authService.getUserRepository();
    apiTokenRepository = authService.getApiTokenRepository();

    userFactory = jwt.getUserFactory();
    apiTokenFactory = jwt.getApiTokenFactory();
  });

  describe("repositories", () => {
    test("should return the user repository", () => {
      expect(userRepository).toBeInstanceOf(InMemoryUserRepository);
    });

    test("should return the api token repository", () => {
      expect(apiTokenRepository).toBeInstanceOf(InMemoryApiTokenRepository);
    });

    test("should create and return a user", async () => {
      const user = await userRepository.create({
        id: "1",
        email: "test@test.com",
        hashedPassword: "password",
        aclRoles: [],
        aclGroups: [],
      });
      const foundUser = await userRepository.findById(user.getId());

      expect(foundUser).toBeDefined();
      expect(foundUser?.getEmail()).toBe("test@test.com");
      expect(foundUser?.getHashedPassword()).toBe("password");
    });

    test("should create and return a api token", async () => {
      const apiToken = await apiTokenRepository.create({
        id: "1",
        userId: "1",
        token: "token",
        scopes: [],
        options: {},
        revokedAt: null,
        expiresAt: null,
      });
      const foundApiToken = await apiTokenRepository.findOneActiveToken(
        apiToken.getToken(),
      );

      expect(foundApiToken).toBeDefined();
      expect(foundApiToken?.getToken()).toBe("token");
      expect(foundApiToken?.getUserId()).toBe("1");
      expect(foundApiToken?.getScopes()).toEqual([]);
      expect(foundApiToken?.getOptions()).toEqual({});
    });
  });

  describe("factory", () => {
    test("should return the user factory", () => {
      expect(userFactory).toBeInstanceOf(TestUserFactory);
    });

    test("should create and return a user", async () => {
      const user = userFactory.create({
        email: "test@test.com",
        hashedPassword: "password",
        aclRoles: [],
        aclGroups: [],
      });
      expect(user).toBeDefined();
      expect(user?.getEmail()).toBe("test@test.com");
      expect(user?.getHashedPassword()).toBe("password");
    });

    test("should return the api token factory", () => {
      expect(apiTokenFactory).toBeInstanceOf(TestApiTokenFactory);
    });

    test("should create and return a api token", async () => {
      const apiToken = apiTokenFactory.create({
        token: "token",
        scopes: [],
        options: {},
      });

      expect(apiToken).toBeDefined();
      expect(apiToken?.getToken()).toBe("token");
      expect(apiToken?.getScopes()).toEqual([]);
      expect(apiToken?.getOptions()).toEqual({});
    });
  });

  describe("attemptCredentials", () => {
    test("should hash password and attempt credentials successfully", async () => {
      await userRepository.create({
        id: "1",
        email: "test@test.com",
        hashedPassword: await jwt.hashPassword("password"),
        aclRoles: [],
        aclGroups: [],
      });

      const jwtToken = await jwt.attemptCredentials(
        "test@test.com",
        "password",
      );

      expect(typeof jwtToken).toBe("string");
      expect(jwtToken.length).toBeGreaterThan(0);
    });

    test("should throw an error with invalid credentials", async () => {
      await userRepository.create({
        id: "1",
        email: "test@test.com",
        hashedPassword: await jwt.hashPassword("password"),
        aclRoles: [],
        aclGroups: [],
      });

      await expect(
        jwt.attemptCredentials("test@test.com", "invalid"),
      ).rejects.toThrow("Unauthorized");
    });
  });

  describe("attemptAuthenticateToken", () => {
    test("should authorize a user and attempt authenticate token successfully", async () => {
      await userRepository.create({
        id: "1",
        email: "test@test.com",
        hashedPassword: await jwt.hashPassword("password"),
        aclRoles: [],
        aclGroups: [],
      });
      const jwtToken = await jwt.attemptCredentials(
        "test@test.com",
        "password",
      );
      const apiToken = await jwt.attemptAuthenticateToken(jwtToken);

      expect(apiToken).toBeDefined();
      expect(apiToken?.getUserId()).toBe("1");
      expect(apiToken?.getScopes()).toEqual([]);
      expect(apiToken?.getOptions()).toEqual({
        expiresAfterMinutes: 60,
      });
    });

    test("should authorize a user and attempt authenticate token successfully with scopes", async () => {
      await userRepository.create({
        id: "1",
        email: "test@test.com",
        hashedPassword: await jwt.hashPassword("password"),
        aclRoles: ["user"],
        aclGroups: ["user"],
      });
      const jwtToken = await jwt.attemptCredentials(
        "test@test.com",
        "password",
        ["user:read", "user:write"],
      );
      const apiToken = await jwt.attemptAuthenticateToken(jwtToken);

      expect(apiToken).toBeDefined();
      expect(apiToken?.getUserId()).toBe("1");
      expect(apiToken?.hasScope("user:read")).toBe(true);
      expect(apiToken?.hasScope("user:write")).toBe(true);
      expect(apiToken?.getOptions()).toEqual({
        expiresAfterMinutes: 60,
      });
    });

    test("should authorize a user and attempt authenticate token successfully with scopes with group scopes", async () => {
      await userRepository.create({
        id: "1",
        email: "test@test.com",
        hashedPassword: await jwt.hashPassword("password"),
        aclRoles: ["admin"],
        aclGroups: ["admin"],
      });
      const jwtToken = await jwt.attemptCredentials(
        "test@test.com",
        "password",
        ["user:read", "user:write"],
      );
      const apiToken = await jwt.attemptAuthenticateToken(jwtToken);

      expect(apiToken).toBeDefined();
      expect(apiToken?.getUserId()).toBe("1");
      expect(apiToken?.hasScope("admin:read", true)).toBe(true);
      expect(apiToken?.hasScope("admin:write", true)).toBe(true);
      expect(apiToken?.hasScope("user:read", true)).toBe(true);
      expect(apiToken?.hasScope("user:write", true)).toBe(true);
      expect(apiToken?.getOptions()).toEqual({
        expiresAfterMinutes: 60,
      });
    });

    test("should authorize a user and successfully set expiresAt", async () => {
      await userRepository.create({
        id: "1",
        email: "test@test.com",
        hashedPassword: await jwt.hashPassword("password"),
        aclRoles: ["admin"],
        aclGroups: ["admin"],
      });
      const jwtToken = await jwt.attemptCredentials(
        "test@test.com",
        "password",
        ["user:read", "user:write"],
      );
      const apiToken = await jwt.attemptAuthenticateToken(jwtToken);

      const dateNowPlusOneHour = new Date(Date.now() + 1 * 60 * 60 * 1000);
      const expiresAt = apiToken?.getExpiresAt();

      expect(apiToken).toBeDefined();
      expect(apiToken?.getUserId()).toBe("1");
      expect(expiresAt).toBeDefined();

      const expectedDateComponents = {
        year: dateNowPlusOneHour.getFullYear(),
        month: dateNowPlusOneHour.getMonth(),
        day: dateNowPlusOneHour.getDate(),
        hour: dateNowPlusOneHour.getHours(),
        minute: dateNowPlusOneHour.getMinutes(),
      };

      const actualDateComponents = {
        year: expiresAt!.getFullYear(),
        month: expiresAt!.getMonth(),
        day: expiresAt!.getDate(),
        hour: expiresAt!.getHours(),
        minute: expiresAt!.getMinutes(),
      };

      // Assert both dates are equal up to the minute
      expect(actualDateComponents).toEqual(expectedDateComponents);
    });

    test("should throw an error if provided ill formed token", async () => {
      await expect(jwt.attemptAuthenticateToken("invalid")).rejects.toThrow("Unauthorized");
    });

    test("should return null if token is invalid", async () => {
      await expect(jwt.attemptAuthenticateToken("invalid")).rejects.toThrow(
        "Unauthorized",
      );
    });

    test("should return null if token is revoked", async () => {
      await userRepository.create({
        id: "1",
        email: "test@test.com",
        hashedPassword: await jwt.hashPassword("password"),
        aclRoles: [],
        aclGroups: [],
      });
      const jwtToken = await jwt.attemptCredentials(
        "test@test.com",
        "password",
      );
      const apiToken = await jwt.attemptAuthenticateToken(jwtToken);

      expect(apiToken).toBeInstanceOf(TestApiTokenModel);

      await apiTokenRepository.revokeToken(apiToken as TestApiTokenModel);

      expect(await jwt.attemptAuthenticateToken(jwtToken)).toBeNull();
    });

    test("should return null if token is expired", async () => {
      const dateInPast = new Date(Date.now() - 1000);

      await userRepository.create({
        id: "1",
        email: "test@test.com",
        hashedPassword: await jwt.hashPassword("password"),
        aclRoles: [],
        aclGroups: [],
      });
      const jwtToken = await jwt.attemptCredentials(
        "test@test.com",
        "password",
      );
      const apiToken = await jwt.attemptAuthenticateToken(jwtToken);

      expect(apiToken).toBeInstanceOf(TestApiTokenModel);

      await (apiTokenRepository as InMemoryApiTokenRepository).update(
        "id",
        apiToken?.getId(),
        {
          expiresAt: dateInPast,
        },
      );

      expect(await jwt.attemptAuthenticateToken(jwtToken)).toBeNull();
    });
  });

  describe("createJwtFromUser", () => {
    test("should create a jwt token from a user", async () => {
      const user = await userRepository.create({
        id: "1",
        email: "test@test.com",
        hashedPassword: await jwt.hashPassword("password"),
        aclRoles: [],
        aclGroups: [],
      });

      const jwtToken = await jwt.createJwtFromUser(user);

      expect(typeof jwtToken).toBe("string");
      expect(jwtToken.length).toBeGreaterThan(0);
    });
  });

  describe("refreshToken", () => {
    test("should refresh a jwt token", async () => {
      await userRepository.create({
        id: "1",
        email: "test@test.com",
        hashedPassword: await jwt.hashPassword("password"),
        aclRoles: [],
        aclGroups: [],
      });

      const jwtToken = await jwt.attemptCredentials(
        "test@test.com",
        "password",
      );
      const apiToken = await jwt.attemptAuthenticateToken(jwtToken);

      // Change token to make the refreshed token different
      await (apiTokenRepository as InMemoryApiTokenRepository).update(
        "id",
        apiToken?.getId(),
        {
          token: "new-token",
        },
      );

      const refreshedJwtToken = jwt.refreshToken(apiToken as TestApiTokenModel);

      expect(refreshedJwtToken).toBeDefined();
      expect(refreshedJwtToken.length).toBeGreaterThan(0);
      expect(refreshedJwtToken).not.toBe(jwtToken);
    });
  });

  describe("revokeToken", () => {
    test("should revoke a jwt token", async () => {
      await userRepository.create({
        id: "1",
        email: "test@test.com",
        hashedPassword: await jwt.hashPassword("password"),
        aclRoles: [],
        aclGroups: [],
      });

      const jwtToken = await jwt.attemptCredentials(
        "test@test.com",
        "password",
      );
      const apiToken = await jwt.attemptAuthenticateToken(jwtToken);

      expect(apiToken?.getRevokedAt()).toBeNull();

      await jwt.revokeToken(apiToken as TestApiTokenModel);

      expect(apiToken?.getRevokedAt()).toBeDefined();
      expect(apiToken?.getRevokedAt()).toBeInstanceOf(Date);
    });
  });

  describe("revokeAllTokens", () => {
    test("should revoke all tokens for a user", async () => {
      await userRepository.create({
        id: "1",
        email: "test@test.com",
        hashedPassword: await jwt.hashPassword("password"),
        aclRoles: [],
        aclGroups: [],
      });

      const jwtToken = await jwt.attemptCredentials(
        "test@test.com",
        "password",
      );
      const apiToken = await jwt.attemptAuthenticateToken(jwtToken);
      const apiTokenId = apiToken?.getId();
      const apiToken2 = await jwt.attemptAuthenticateToken(jwtToken);
      const apiToken2Id = apiToken2?.getId();

      expect(apiToken?.getRevokedAt()).toBeNull();
      expect(apiToken2?.getRevokedAt()).toBeNull();

      await jwt.revokeAllTokens(apiToken?.getUserId() as string);

      const refreshedApiToken = await (
        apiTokenRepository as InMemoryApiTokenRepository
      ).findById(apiTokenId as string);
      const refreshedApiToken2 = await (
        apiTokenRepository as InMemoryApiTokenRepository
      ).findById(apiToken2Id as string);

      expect(refreshedApiToken?.getRevokedAt()).toBeDefined();
      expect(refreshedApiToken2?.getRevokedAt()).toBeDefined();
    });
  });

  describe("authorizeUser", () => {
    test("should error if no session is started", async () => {
      const user = await userRepository.create({
        id: "1",
        email: "test@test.com",
        hashedPassword: await jwt.hashPassword("password"),
        aclRoles: [],
        aclGroups: [],
      });

      expect(() => jwt.authorizeUser(user)).toThrow(
        "No session found in current context",
      );
    });

    test("should authorize a user and set the session data", async () => {
      await asyncSession.runWithSession(async () => {
        const user = await userRepository.create({
          id: "1",
          email: "test@test.com",
          hashedPassword: await jwt.hashPassword("password"),
          aclRoles: [],
          aclGroups: [],
        });

        jwt.authorizeUser(user);

        const check = await jwt.check();
        const foundUser = await jwt.user();

        expect(foundUser).toBeDefined();
        expect(foundUser?.getId()).toBe(user.getId());
        expect(check).toBe(true);
        expect(asyncSession.getSessionData()).toEqual({
          userId: user.getId(),
          scopes: [],
        });
      });
    });

    test("should authorize a user and set the session data with scopes", async () => {
      await asyncSession.runWithSession(async () => {
        const user = await userRepository.create({
          id: "1",
          email: "test@test.com",
          hashedPassword: await jwt.hashPassword("password"),
          aclRoles: [],
          aclGroups: [],
        });

        jwt.authorizeUser(user, ["user:read", "user:write"]);

        const check = await jwt.check();
        const foundUser = await jwt.user();

        expect(foundUser).toBeDefined();
        expect(foundUser?.getId()).toBe(user.getId());
        expect(check).toBe(true);
        expect(asyncSession.getSessionData()).toEqual({
          userId: user.getId(),
          scopes: ["user:read", "user:write"],
        });
      });
    });

    test("should logout a user and clear the session data", async () => {
      await asyncSession.runWithSession(async () => {
        const user = await userRepository.create({
          id: "1",
          email: "test@test.com",
          hashedPassword: await jwt.hashPassword("password"),
          aclRoles: [],
          aclGroups: [],
        });

        jwt.authorizeUser(user);

        const check = await jwt.check();
        const foundUser = await jwt.user();

        expect(foundUser).toBeDefined();
        expect(foundUser?.getId()).toBe(user.getId());
        expect(check).toBe(true);
        expect(asyncSession.getSessionData()).toEqual({
          userId: user.getId(),
          scopes: [],
        });

        jwt.logout();

        const check2 = await jwt.check();
        const foundUser2 = await jwt.user();

        expect(check2).toBe(false);
        expect(foundUser2).toBeNull();
        expect(asyncSession.getSessionData()).toEqual({
          userId: undefined,
          scopes: undefined,
        });
      });
    });
  });

  describe("buildApiTokenByUser", () => {
    test("should create api token with role scopes", async () => {
      const user = await userRepository.create({
        id: "1",
        email: "test@test.com",
        hashedPassword: await jwt.hashPassword("password"),
        aclRoles: ["user"],
        aclGroups: ["user"],
      });

      const apiToken = await jwt.buildApiTokenByUser(user);

      expect(apiToken).toBeDefined();
      expect(apiToken?.getScopes()).toEqual(["user:read", "user:write"]);
    });

    test("should create api token with role scopes and custom scopes", async () => {
      const user = await userRepository.create({
        id: "1",
        email: "test@test.com",
        hashedPassword: await jwt.hashPassword("password"),
        aclRoles: ["user"],
        aclGroups: ["user"],
      });

      const apiToken = await jwt.buildApiTokenByUser(user, ["custom:scope"]);

      expect(apiToken).toBeDefined();
      expect(apiToken?.getScopes()).toEqual([
        "user:read",
        "user:write",
        "custom:scope",
      ]);
    });

    test("should create api token with role scopes and custom scopes and options", async () => {
      const user = await userRepository.create({
        id: "1",
        email: "test@test.com",
        hashedPassword: await jwt.hashPassword("password"),
        aclRoles: ["user"],
        aclGroups: ["user"],
      });

      const apiToken = await jwt.buildApiTokenByUser(user, ["custom:scope"], {
        customOption: 10,
      });

      expect(apiToken).toBeDefined();
      expect(apiToken?.getScopes()).toEqual([
        "user:read",
        "user:write",
        "custom:scope",
      ]);
      expect(apiToken?.getOptions()).toEqual({ customOption: 10 });
    });
  });
});
