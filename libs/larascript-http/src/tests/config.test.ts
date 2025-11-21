import HttpCodes from "@/http/data/HttpCodes.js";
import { DatabaseResourceRepository } from "@/http/resources/repository/DatabaseResourceRepository.js";
import HttpRouter from "@/http/router/HttpRouter.js";
import { beforeEach, describe, test } from "@jest/globals";
import { IUserModel } from "@larascript-framework/contracts/auth";
import { IHttpService, MiddlewareConstructor } from "@larascript-framework/contracts/http";
import { HttpEnvironment } from "../http/environment/HttpEnvironment.js";
import { createMockAuthorizeUserMiddleware } from "./helpers/createMockAuthorizeUserMiddleware.js";
import { TestHttpEnvironment } from "./helpers/TestHttpEnvironment.js";
import { MockModel } from "./repository/MockModel.js";
import { resetMockModelTable } from "./repository/resetMockModelTable.js";

const headers = {
    "Content-Type": "application/json",
}

describe("config test suite", () => {
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

    describe("configuration", () => {
        test("should be able configure a model datasource", async () => {
            const router = new HttpRouter();
            expect(
                () => router.resource({
                    prefix: '/test',
                    datasource: {
                        modelConstructor: MockModel,
                    }
                })
            ).not.toThrow();
        })

        test('should be able to configure a repository datasource', async () => {
            const router = new HttpRouter();
            expect(
                () => router.resource({
                    prefix: '/test',
                    datasource: {
                        repository: new DatabaseResourceRepository({
                            modelConstructor: MockModel,
                        }),
                    }
                })
            ).not.toThrow();
        })

        test("should throw an error if the resource owner attribute is not the same as the expected resource owner attribute", async () => {
            const router = new HttpRouter();
            router.resource({
                prefix: '/test',
                datasource: {
                    modelConstructor: MockModel,
                },
                security: [
                    router.security().resourceOwner('notUserId'),
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
                    age: 20,
                }),
            })

            const body = await response.json() as {
                error: string
            }

            expect(body.error).toBe('Expected the resource owner attribute to be userId but received notUserId')
            expect(response.status).toBe(HttpCodes.INTERNAL_SERVER_ERROR)
        })
    })

});
