import HttpRouter from "@/http/router/HttpRouter.js";
import { beforeEach, describe } from "@jest/globals";
import { IUserModel } from "@larascript-framework/contracts/auth";
import { IHttpService, MiddlewareConstructor } from "@larascript-framework/contracts/http";
import { BaseCustomValidator, IRulesObject, NumberRule, RequiredRule, StringRule } from "@larascript-framework/larascript-validator";
import { HttpEnvironment } from "../http/environment/HttpEnvironment.js";
import { createMockAuthorizeUserMiddleware } from "./helpers/createMockAuthorizeUserMiddleware.js";
import { TestHttpEnvironment } from "./helpers/TestHttpEnvironment.js";
import { MockModel } from "./repository/MockModel.js";
import { resetMockModelTable } from "./repository/resetMockModelTable.js";

const headers = {
    "Content-Type": "application/json",
}

describe("resources create test suite", () => {
    let httpService: IHttpService;
    let serverPort: number;
    let user: IUserModel;
    let MockAuthorizeMiddleware: MiddlewareConstructor;

    beforeEach(async () => {
        await TestHttpEnvironment.create().boot();

        httpService = HttpEnvironment.getInstance().httpService;

        await resetMockModelTable();

        user = await HttpEnvironment.getInstance().authEnvironment.userCreationService.createAndSave({
            email: 'test@test.com',
            password: 'password'
        })
        MockAuthorizeMiddleware = createMockAuthorizeUserMiddleware(user);

        serverPort = httpService.getPort()!;
    });

    describe("create resource", () => {
        test("should not be able to create a resource while not being authenticated", async () => {
            const router = new HttpRouter();
            router.resource({
                prefix: '/test',
                datasource: {
                    modelConstructor: MockModel,
                },
            })
            httpService.useRouterAndApply(router);

            const response = await fetch(`http://localhost:${serverPort}/test`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    name: 'Test',
                    age: 20,
                }),
            })

            expect(response.status).toBe(401)
        })

        test("should be able to create a resource while authenticated", async () => {
            const router = new HttpRouter();
            router.resource({
                prefix: '/test',
                datasource: {
                    modelConstructor: MockModel,
                },
                middlewares: [
                    MockAuthorizeMiddleware,
                ]
            })
            httpService.useRouterAndApply(router);

            const response = await fetch(`http://localhost:${serverPort}/test`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    name: 'Test',
                    age: 20,
                }),
            })

            const body = await response.json() as {
                data: {
                    id: string,
                    name: string,
                    age: number
                }
            }
            expect(body.data.id).toBeDefined()
            expect(body.data.name).toBe('Test')
            expect(body.data.age).toBe(20)
            expect(response.status).toBe(201)
        })

        test("should not be able to create a resource if validation fails", async () => {
            const createValidator = class extends BaseCustomValidator {
                protected rules: IRulesObject = {
                    name: [new RequiredRule(), new StringRule()],
                    age: [new RequiredRule(), new NumberRule()],
                }
            }

            const router = new HttpRouter();
            router.resource({
                prefix: '/test',
                datasource: {
                    modelConstructor: MockModel,
                },
                validation: {
                    create: createValidator,
                },
                middlewares: [
                    MockAuthorizeMiddleware,
                ]
            })
            httpService.useRouterAndApply(router);

            const response = await fetch(`http://localhost:${serverPort}/test`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    name: undefined,
                    age: undefined,
                }),
            })
            const body = await response.json() as {
                data: {
                    errors: Record<string, string[]>
                }
            }

            expect(response.status).toBe(422)
            expect(body.data.errors.name).toBeDefined()
            expect(body.data.errors.age).toBeDefined()
        })

        test("should add the owner's id to the resource", async () => {

            const router = new HttpRouter();
            router.resource({
                prefix: '/test',
                datasource: {
                    modelConstructor: MockModel,
                },
                security: [
                    router.security().resourceOwner('userId'),
                ],
                middlewares: [
                    MockAuthorizeMiddleware,
                ]
            })
            httpService.useRouterAndApply(router);

            const response = await fetch(`http://localhost:${serverPort}/test`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    name: 'Test',
                    age: 20
                }),
            })
            const body = await response.json() as {
                data: {
                    id: string,
                    name: string,
                    userId: string,
                    age: number
                }
            }

            expect(response.status).toBe(201)
            expect(body.data.name).toBe('Test')
            expect(body.data.age).toBe(20)
            expect(body.data.userId).toBe(user.getId())
        })
    });
});
