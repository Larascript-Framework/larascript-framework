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

describe("resources delete test suite", () => {
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

    describe("delete resource", () => {
        test("should not be able to delete a resource while not being authorized", async () => {
            const model = await MockModel.create({
                name: 'Test',
                age: 20
            });
            await model.save();

            const router = new HttpRouter();
            router.resource({
                prefix: '/test',
                datasource: {
                    modelConstructor: MockModel,
                }
            })
            httpService.useRouterAndApply(router);

            const response = await fetch(`http://localhost:${serverPort}/test/${model.getId()}`, {
                method: 'DELETE',
                headers,
            })
            const foundModel = await MockModel.query().where('id', model.getId()).first();

            expect(foundModel).toBeDefined()
            expect(response.status).toBe(HttpCodes.UNAUTHORIZED)
        })

        test("should be able to delete a resourc while being authorized", async () => {
            const model = await MockModel.create({
                name: 'Test',
                age: 20
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
                method: 'DELETE',
                headers,
            })
            const foundModel = await MockModel.query().where('id', model.getId()).first();

            expect(foundModel).toBeNull()
            expect(response.status).toBe(200)
        })

        test("should not be able to delete a resource if validation fails", async () => {
            const createValidator = class extends BaseCustomValidator {
                protected rules: IRulesObject = {
                    name: [new RequiredRule(), new StringRule()],
                    age: [new RequiredRule(), new NumberRule()],

                }
            }

            const model = await MockModel.create({
                name: 'Test',
                age: 20
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
                    delete: createValidator,
                }
            })
            httpService.useRouterAndApply(router);

            const response = await fetch(`http://localhost:${serverPort}/test/${model.getId()}`, {
                method: 'DELETE',
                headers,
            })
            const body = await response.json() as {
                data: {
                    errors: Record<string, string[]>
                }
            }
            const foundModel = await MockModel.query().where('id', model.getId()).first();

            expect(foundModel).toBeDefined()
            expect(response.status).toBe(HttpCodes.UNPROCESSABLE_ENTITY)
            expect(body.data.errors.name).toBeDefined()
            expect(body.data.errors.age).toBeDefined()
        })

        test("should be able to delete a resource if it is owned by the user", async () => {
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
                method: 'DELETE',
                headers,
            })
            const foundModel = await MockModel.query().where('id', model.getId()).first();

            expect(response.status).toBe(200)
            expect(foundModel).toBeNull()
        })

        test("should not be able to delete a resource if it is not owned by the user", async () => {
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
                method: 'DELETE',
                headers,
            })
            const foundModel = await MockModel.query().where('id', model.getId()).first();

            const text = await response.text();
            expect(response.status).toBe(HttpCodes.FORBIDDEN)
            expect(foundModel).toBeDefined()
        })
    })
});
