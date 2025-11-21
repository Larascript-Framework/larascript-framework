
import { AuthEnvironment } from "@/environment/AuthEnvironment.js";
import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import { IAclConfig } from "@larascript-framework/contracts/acl";
import {
  BasicACLService,
} from "@larascript-framework/larascript-acl";
import { IAuthAdapter, IAuthConfig } from "../auth/index.js";
import AuthService from "../auth/services/AuthService.js";
import { TestApiTokenFactory } from "./factory/TestApiTokenFactory.js";
import { TestUserFactory } from "./factory/TestUserFactory.js";
import { InMemoryApiTokenRepository } from "./repository/InMemoryApiTokenRepository.js";
import { InMemoryUserRepository } from "./repository/InMemoryUserRepository.js";
import { TestAuthEnvironment } from "./utils/TestAuthEnvironment.js";

type MockCustomAdapterConfig = {
  name: "custom";
  options: {
    customSetting: "test-setting";
  };
};

const mockCustomAdapter = {
  boot: jest.fn().mockImplementation(() => Promise.resolve()),
  getConfig: jest.fn().mockReturnValue({
    name: "custom",
    options: {
      customSetting: "test-setting",
    },
  }),
  authorizeUser: jest.fn(),
  check: jest.fn().mockImplementation(() => Promise.resolve(false)),
  user: jest.fn().mockImplementation(() => Promise.resolve(null)),
} as IAuthAdapter<MockCustomAdapterConfig>;

const mockAclConfig: IAclConfig = {
  roles: [],
  groups: [],
  defaultGroup: "default",
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
    custom: {
      name: "custom",
      options: {
        customSetting: "test-setting",
      },
    },
  },
};

describe("AuthService", () => {
  let authService: AuthService;

  beforeEach(async () => {
    jest.clearAllMocks();

    await TestAuthEnvironment.create({
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
        custom: {
          name: "custom",
          options: {
            customSetting: "test-setting",
          },
        },
      },
    }).boot();
    authService = AuthEnvironment.getInstance().authService as AuthService;
    authService.addAdapterOnce("custom", mockCustomAdapter);
  });

  describe("boot", () => {
    describe("acl", () => {
      test("should return the ACL service", () => {
        expect(authService.acl()).toBeInstanceOf(BasicACLService);
      });
    });

    test("should return the JWT adapter", () => {
      expect(authService.getJwt()).toBeDefined();
    });

    test("should register and boot custom adapters", async () => {
      expect(authService.getAdapter("custom")).toBe(mockCustomAdapter);
      expect(authService.getAdapter("custom").getConfig()).toEqual({
        name: "custom",
        options: {
          customSetting: "test-setting",
        },
      });
    });

    test("should fail for invalid adapter name", () => {
      expect(() => authService.getAdapter("invalid")).toThrow(
        new Error("Adapter invalid not found"),
      );
    });
  });

  describe("getJwt", () => {
    test("should return JWT adapter with correct config", async () => {
      const jwtAdapter = authService.getJwt();
      expect(jwtAdapter).toBeDefined();
      expect(jwtAdapter.getConfig().options.expiresInMinutes).toBe(60);
      expect(jwtAdapter.getConfig().options.secret).toBe("test-secret");
      expect(jwtAdapter.getConfig().options.factory.user).toBe(TestUserFactory);
      expect(jwtAdapter.getConfig().options.factory.apiToken).toBe(
        TestApiTokenFactory,
      );
      expect(jwtAdapter.getConfig().options.repository.user).toBe(
        InMemoryUserRepository,
      );
      expect(jwtAdapter.getConfig().options.repository.apiToken).toBe(
        InMemoryApiTokenRepository,
      );
    });

    test("should return custom adapter with correct config", async () => {
      const customAdapter = authService.getAdapter("custom");
      expect(customAdapter).toBe(mockCustomAdapter);

      const config = customAdapter.getConfig() as MockCustomAdapterConfig;
      expect(config.options.customSetting).toBe("test-setting");
    });
  });
});
