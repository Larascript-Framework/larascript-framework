import HttpCodes from "@/http/data/HttpCodes.js";
import HttpRouter from "@/http/router/HttpRouter.js";
import { beforeEach, describe, test } from "@jest/globals";
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

describe("resources test suite", () => {
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

    describe("update resource", () => {
        test("should not be able to update a resource while not being authorized", async () => {
            const model = await MockModel.create({
                name: 'Test',
                age: 20,
            });
            await model.save();

            const router = new HttpRouter();
            router.resource({
                prefix: '/test',
                datasource: {
                    modelConstructor: MockModel,
                },
            })
            httpService.useRouterAndApply(router);

            const response = await fetch(`http://localhost:${serverPort}/test/${model.getId()}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify({
                    name: 'Test Updated',
                    age: 20
                }),
            })

            expect(response.status).toBe(401)
        })

        test("should be able to update a resource while being authorized", async () => {
            const model = await MockModel.create({
                name: 'Test',
                age: 20,
            });
            await model.save();

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

            const response = await fetch(`http://localhost:${serverPort}/test/${model.getId()}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify({
                    name: 'Test Updated',
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

            expect(response.status).toBe(200)
            expect(body.data.name).toBe('Test Updated')
        })

        test("should not be able to update a resource if validation fails", async () => {
            const createValidator = class extends BaseCustomValidator {
                protected rules: IRulesObject = {
                    name: [new RequiredRule(), new StringRule()],
                    age: [new RequiredRule(), new NumberRule()],
                }
            }

            const model = await MockModel.create({
                name: 'Test',
                age: 20,
            });
            await model.save();

            const router = new HttpRouter();
            router.resource({
                prefix: '/test',
                datasource: {
                    modelConstructor: MockModel,
                },
                middlewares: [
                    MockAuthorizeMiddleware,
                ],
                validation: {
                    update: createValidator,
                }
            })
            httpService.useRouterAndApply(router);

            const response = await fetch(`http://localhost:${serverPort}/test/${model.getId()}`, {
                method: 'PUT',
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

            expect(response.status).toBe(HttpCodes.UNPROCESSABLE_ENTITY)
            expect(body.data.errors.name).toBeDefined()
            expect(body.data.errors.age).toBeDefined()
        })


        test("should be able to update a resource if it is owned by the user", async () => {
            const model = await MockModel.create({
                name: 'Test',
                age: 20,
                userId: user.getId(),
            });
            await model.save();

            const router = new HttpRouter();
            router.resource({
                prefix: '/test',
                datasource: {
                    modelConstructor: MockModel,
                },
                middlewares: [
                    MockAuthorizeMiddleware,
                ],
                security: [
                    router.security().resourceOwner('userId'),
                ],
            })
            httpService.useRouterAndApply(router);

            const response = await fetch(`http://localhost:${serverPort}/test/${model.getId()}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify({
                    name: 'Test Updated',
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

            expect(response.status).toBe(200)
            expect(body.data.name).toBe('Test Updated')
            expect(body.data.userId).toBe(user.getId())
        })

        test("should not be able to update a resource if it is not owned by the user", async () => {
            const model = await MockModel.create({
                name: 'Test',
                age: 20,
                userId: 'not-user-id',
            });
            await model.save();

            const router = new HttpRouter();
            router.resource({
                prefix: '/test',
                datasource: {
                    modelConstructor: MockModel,
                },
                middlewares: [
                    MockAuthorizeMiddleware,
                ],
                security: [
                    router.security().resourceOwner('userId'),
                ],
            })
            httpService.useRouterAndApply(router);

            const response = await fetch(`http://localhost:${serverPort}/test/${model.getId()}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify({
                    name: 'Test Updated',
                    age: 20
                }),
            })
            expect(response.status).toBe(HttpCodes.FORBIDDEN)
        })
    })

});
