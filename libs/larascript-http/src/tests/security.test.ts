import Controller from "@/http/base/Controller.js";
import Middleware from "@/http/base/Middleware.js";
import HttpContext from "@/http/context/HttpContext.js";
import HttpCodes from "@/http/data/HttpCodes.js";
import { ALWAYS, ScopeRuleConfig, SecurityEnum } from "@/http/index.js";
import HttpRouter from "@/http/router/HttpRouter.js";
import SecurityReader from "@/http/security/services/SecurityReader.js";
import HttpService from "@/http/services/HttpService.js";
import { beforeEach, describe, expect, test } from "@jest/globals";
import { IUserModel } from "@larascript-framework/contracts/auth";
import { HttpEnvironment } from "../http/environment/HttpEnvironment.js";
import { TestHttpEnvironment } from "./helpers/TestHttpEnvironment.js";

describe("security test suite", () => {
    let httpService: HttpService;
    let serverPort: number;

    beforeEach(async () => {
        await TestHttpEnvironment.create().boot();

        httpService = HttpEnvironment.getInstance().httpService as HttpService;

        // Get the actual port the server is listening on
        serverPort = httpService.getPort()!;
    });

    describe("basic security rules", () => {
        test("should be able to use security rules when building routes", async () => {
            const controller = class extends Controller {
                async invoke(context: HttpContext) {
                    const routeItem = context.getRouteItem();
                    const securityRule = SecurityReader.find(
                        routeItem!,
                        SecurityEnum.ENABLE_SCOPES,
                        [ALWAYS]
                    )
                    const options = securityRule?.getRuleOptions() as ScopeRuleConfig;

                    expect(securityRule).not.toBeNull();
                    expect(options?.scopes).toBe('test');
                    expect(options?.exactMatch).toBe(true);

                    return context.getResponse().send({
                        scopes: options?.scopes,
                        exactMatch: options?.exactMatch,
                    });
                }
            }

            const router = new HttpRouter();
            router.get('/test', controller, {
                security: [
                    router.security().scopes('test', true),
                ],
            });

            httpService.useRouterAndApply(router);
            await httpService.listen();

            const response = await fetch(`http://localhost:${serverPort}/test`, {
                method: 'GET',
            });
            const body = await response.json() as { error: string };
            expect(response.status).toBe(401);
            expect(body.error).toBe('Unauthorized');
            expect(httpService.getRegisteredRoutes()).not.toBeNull();
        })
    })

    describe("rateLimited rule", () => {
        test("should fail when the limit is exceeded", async () => {
            
            const controller = class extends Controller {
                async invoke(context: HttpContext) {
                    return context.getResponse().send({
                        message: 'test',
                    });
                }
            }

            const router = new HttpRouter();
            router.get('/test', controller, {
                security: [router.security().rateLimited(1, 60)]
            });
            httpService.useRouterAndApply(router);

            const response = await fetch(`http://localhost:${serverPort}/test`, {
                method: 'GET',
            });
            const response2 = await fetch(`http://localhost:${serverPort}/test`, {
                method: 'GET',
            });

            expect(response.status).toBe(HttpCodes.OK);
            expect(response2.status).toBe(HttpCodes.TOO_MANY_REQUESTS);
        })
    })

    describe("hasRole rule", () => {
        test("should pass when user has role", async () => {
            const FakeUserMiddleware = class extends Middleware {
                async execute(context: HttpContext) {
                    context.getRequest().user = {
                        getId: () => 1,
                        getAclRoles: () => ['admin'],
                    } as unknown as IUserModel;
                    this.next();
                }
            }

            const controller = class extends Controller {
                async invoke(context: HttpContext) {
                    const user = context.getUser();
                    return context.getResponse().send({
                        message: 'test',
                        user: user,
                    });
                }
            }

            const router = new HttpRouter();
            const security = [
                router.security().hasRole('admin'),
            ];
            router.get('/test', controller, {
                middlewares: [FakeUserMiddleware],
                security: security,
            });

            httpService.useRouterAndApply(router);
            await httpService.listen();

            const response = await fetch(`http://localhost:${serverPort}/test`, {
                method: 'GET',
            });
            expect(response.status).toBe(200);
        })


        test("has role rule, fails when user does not have role", async () => {
            const FakeUserMiddleware = class extends Middleware {
                async execute(context: HttpContext) {
                    context.getRequest().user = {
                        getId: () => 1,
                        getAclRoles: () => ['user'],
                    } as unknown as IUserModel;
                    this.next();
                }
            }

            const controller = class extends Controller {
                async invoke(context: HttpContext) {
                    const user = context.getUser();
                    return context.getResponse().send({
                        message: 'test',
                        user: user,
                    });
                }
            }

            const router = new HttpRouter();
            const security = [
                router.security().hasRole('admin'),
            ];
            router.get('/test', controller, {
                middlewares: [FakeUserMiddleware],
                security: security,
            });

            httpService.useRouterAndApply(router);
            await httpService.listen();

            const response = await fetch(`http://localhost:${serverPort}/test`, {
                method: 'GET',
            });
            const body = await response.json() as { error: string };
            expect(body.error).toBe('User does not have the required roles');
            expect(response.status).toBe(403);
        })
    })
});
