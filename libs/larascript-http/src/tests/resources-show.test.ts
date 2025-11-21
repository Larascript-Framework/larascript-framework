import HttpCodes from "@/http/data/HttpCodes.js";
import HttpRouter from "@/http/router/HttpRouter.js";
import { beforeEach, describe, test } from "@jest/globals";
import { IUserModel } from "@larascript-framework/contracts/auth";
import { IHttpService, MiddlewareConstructor } from "@larascript-framework/contracts/http";
import { generateUuidV4 } from "@larascript-framework/larascript-utils";
import { HttpEnvironment } from "../http/environment/HttpEnvironment.js";
import { createMockAuthorizeUserMiddleware } from "./helpers/createMockAuthorizeUserMiddleware.js";
import { TestHttpEnvironment } from "./helpers/TestHttpEnvironment.js";
import { MockModel } from "./repository/MockModel.js";
import { resetMockModelTable } from "./repository/resetMockModelTable.js";

const headers = {
    "Content-Type": "application/json",
}

describe("resources show test suite", () => {
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

    describe("show resource", () => {
        test("should be able to show a resource while authenticated", async () => {
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
                method: 'GET',
                headers,
            })
            const body = await response.json() as {
                data: {
                    id: string,
                    name: string,
                    age: number
                }
            }

            expect(response.status).toBe(HttpCodes.OK)
            expect(body.data.id).toBe(model.getId())
            expect(body.data.name).toBe(model.name)
            expect(body.data.age).toBe(model.age)
        })

        test("should not be able to show a resource while not being authenticated", async () => {
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
                method: 'GET',
                headers,
            })

            expect(response.status).toBe(HttpCodes.UNAUTHORIZED)
        })

        test("should be able to show a resource if it is owned by the user", async () => {
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
                method: 'GET',
                headers,
            })
            const body = await response.json() as {
                data: {
                    id: string,
                    name: string,
                    age: number,
                    userId: string
                }
            }

            expect(response.status).toBe(HttpCodes.OK)
            expect(body.data.id).toBe(model.getId())
            expect(body.data.name).toBe(model.name)
            expect(body.data.age).toBe(model.age)
            expect(body.data.userId).toBe(user.getId())
        })

        test("should not be able to show a resource if it is not owned by the user", async () => {
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
                method: 'GET',
                headers,
            })
            
            expect(response.status).toBe(HttpCodes.FORBIDDEN)
        })

        test("should not be able to show a resource and return a 404 if the resource is not found", async () => {
            const router = new HttpRouter();
            router.resource({
                prefix: '/test',
                datasource: {
                    modelConstructor: MockModel,
                },
                middlewares: [
                    MockAuthorizeMiddleware,
                ],
            })
            httpService.useRouterAndApply(router);

            const response = await fetch(`http://localhost:${serverPort}/test/${generateUuidV4()}`, {
                method: 'GET',
                headers
            })
            const body = await response.json() as {
                error: string
            }
            expect(response.status).toBe(HttpCodes.NOT_FOUND)
            expect(body.error).toBe('Resource not found')
        })
    })

});
