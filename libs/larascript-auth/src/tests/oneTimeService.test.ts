import AuthService from "@/auth/services/AuthService.js";
import OneTimeAuthenticationService from "@/auth/services/OneTimeAuthenticationService.js";
import { AsyncSessionService } from "@larascript-framework/async-session";
import { IAclConfig } from "@larascript-framework/contracts/acl";
import {
  IApiTokenModel,
  IAuthConfig,
  IJwtAuthService,
  IUserModel,
  IUserRepository,
} from "@larascript-framework/contracts/auth";
import { TestApiTokenFactory } from "./factory/TestApiTokenFactory.js";
import { TestUserFactory } from "./factory/TestUserFactory.js";
import { InMemoryApiTokenRepository } from "./repository/InMemoryApiTokenRepository.js";
import { InMemoryUserRepository } from "./repository/InMemoryUserRepository.js";

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

describe("OneTimeAuthenticationService", () => {
  let asyncSession: AsyncSessionService;
  let authService: AuthService;
  let oneTimeService: OneTimeAuthenticationService;
  let userRepository: IUserRepository;
  let jwt: IJwtAuthService;
  let user: IUserModel;

  beforeEach(async () => {
    jest.clearAllMocks();

    asyncSession = new AsyncSessionService();

    authService = new AuthService(mockAuthConfig, mockAclConfig, asyncSession);
    await authService.boot();

    oneTimeService = new OneTimeAuthenticationService();
    oneTimeService.setAuthService(authService);

    jwt = authService.getJwt();

    userRepository = authService.getUserRepository();

    user = await userRepository.create({
      id: "1",
      email: "test@test.com",
      hashedPassword: await jwt.hashPassword("password"),
      aclRoles: ["user"],
      aclGroups: ["user"],
    });
  });

  test("should get one time scopes", () => {
    const scopes = oneTimeService.getScope();
    expect(scopes).toBeDefined();
    expect(scopes).toBe("oneTime");
  });

  test("should create a one time authentication token", async () => {
    const token = await oneTimeService.createSingleUseToken(user);

    expect(token).toBeDefined();
    expect(typeof token).toBe("string");
  });

  test("should validate a one time authentication token", async () => {
    const token = await oneTimeService.createSingleUseToken(user);
    const apiToken = await jwt.attemptAuthenticateToken(token);

    expect(apiToken).toBeDefined();
    expect(apiToken?.hasScope("oneTime")).toBe(true);
    expect(
      oneTimeService.validateSingleUseToken(apiToken as IApiTokenModel),
    ).toBe(true);
  });

  test("should not validate token that is not a one time token", async () => {
    const apiToken = await jwt.buildApiTokenByUser(user);

    expect(apiToken?.hasScope("oneTime")).toBe(false);
    expect(
      oneTimeService.validateSingleUseToken(apiToken as IApiTokenModel),
    ).toBe(false);
  });

  test("should not authenticate a one time token after it has been revoked", async () => {
    const token = await oneTimeService.createSingleUseToken(user);
    const apiToken = await jwt.attemptAuthenticateToken(token);

    // This typically would be handled by middleware
    await jwt.revokeToken(apiToken as IApiTokenModel);

    expect(apiToken).toBeDefined();
    expect(
      oneTimeService.validateSingleUseToken(apiToken as IApiTokenModel),
    ).toBe(true);

    const apiToken2 = await jwt.attemptAuthenticateToken(token);
    expect(apiToken2).toBeNull();
  });
});
