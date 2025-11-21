import { ApiTokenFactory, AuthService, UserFactory } from "@/auth/index.js";
import { AuthEnvironment } from "@/environment/AuthEnvironment.js";
import { beforeEach, describe, test } from "@jest/globals";
import { AsyncSessionService } from "@larascript-framework/async-session";
import { IAclConfig } from "@larascript-framework/contracts/acl";
import { IApiTokenFactory, IApiTokenRepository, IAuthConfig, IAuthenticableUserModel, IJwtAuthService, IUserFactory, IUserRepository } from "@larascript-framework/contracts/auth";
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
            user: UserFactory,
            apiToken: ApiTokenFactory,
          },
          repository: {
            user: InMemoryUserRepository,
            apiToken: InMemoryApiTokenRepository,
          },
        },
      },
    },
  };    

describe("user creation test suite", () => {
    let userModel: IAuthenticableUserModel;
    const mockId = "user-123";
    const mockEmail = "test@example.com";
    const mockHashedPassword = "hashed_password_abc123";
    const mockAclRoles = ["admin", "editor"];
    const mockAclGroups = ["developers", "testers"];

    let authService: AuthService;
    let userRepository: IUserRepository;
    let apiTokenRepository: IApiTokenRepository;
    let userFactory: IUserFactory;
    let apiTokenFactory: IApiTokenFactory;
    let jwt: IJwtAuthService;
    let asyncSession: AsyncSessionService;

    beforeEach(async () => {
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

    describe("user creation", () => {
        test("should create a user", async () => {
            userModel = await AuthEnvironment.getInstance().userCreationService.createAndSave({
                email: mockEmail,
                password: mockHashedPassword,
            });

            expect(userModel).toBeDefined();
            expect(userModel.getEmail()).toBe(mockEmail);
            expect(typeof userModel.getHashedPassword()).toBe("string");
        });

        test("should update roles and groups on creation", async () => {
            userModel = await AuthEnvironment.getInstance().userCreationService.createAndSave({
                email: mockEmail,
                password: mockHashedPassword,
            });

            const groups = userModel.getAclGroups();
            const roles = userModel.getAclRoles();

            expect(groups).toContain("user");
            expect(roles).toContain("user");
        });
    });
});
