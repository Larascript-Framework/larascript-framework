import HttpRouter from "@/http/router/HttpRouter.js";
import { beforeEach, describe, test } from "@jest/globals";
import { IUserModel } from "@larascript-framework/contracts/auth";
import { IHttpService, IResourceRepository, MiddlewareConstructor } from "@larascript-framework/contracts/http";
import { HttpEnvironment } from "../http/environment/HttpEnvironment.js";
import { createMockAuthorizeUserMiddleware } from "./helpers/createMockAuthorizeUserMiddleware.js";
import { TestHttpEnvironment } from "./helpers/TestHttpEnvironment.js";

describe("config optional auth test suite", () => {
    let mockAuthorizeMiddleware: MiddlewareConstructor;
    let httpService: IHttpService;
    const mockCustomRepository: IResourceRepository = {} as unknown as IResourceRepository;
    
    beforeEach(async () => {
        await TestHttpEnvironment.create({
            databaseConfigured: false,
            authConfigured: false,
        }).boot();

        httpService = HttpEnvironment.getInstance().httpService;

        mockAuthorizeMiddleware = createMockAuthorizeUserMiddleware({} as IUserModel);
    });

    describe("optional auth dependencies", () => {
        test("should get an error if a authorize middleware is provided but the auth dependencies are not configured", async () => {
            const router = new HttpRouter();
            router.resource({
                prefix: '/test',
                datasource: {
                    repository: mockCustomRepository,
                },
                middlewares: [mockAuthorizeMiddleware],
            })
            
            expect(() => httpService.useRouterAndApply(router)).toThrow('Auth service not configured');
        })

        test("should not get an error if a authorize middleware is provided and the auth dependencies are configured", async () => {
            const router = new HttpRouter();

            HttpEnvironment.getInstance().setPartialConfig({
                authConfigured: false
            });

            expect(() =>
                router.resource({
                    prefix: '/test',
                    datasource: {
                        repository: mockCustomRepository,
                    },
                    middlewares: [mockAuthorizeMiddleware],
                })
            ).not.toThrow();
        })
    })
});
