import Controller from "@/http/base/Controller.js";
import HttpContext from "@/http/context/HttpContext.js";
import HttpCodes from "@/http/data/HttpCodes.js";
import ValidatorMiddleware from "@/http/middleware/ValidatorMiddleware.js";
import HttpRouter from "@/http/router/HttpRouter.js";
import { beforeEach, describe } from "@jest/globals";
import { IUserModel } from "@larascript-framework/contracts/auth";
import { IHttpService } from "@larascript-framework/contracts/http";
import { User } from "@larascript-framework/larascript-auth";
import { BaseCustomValidator, EmailRule, ExistsRule, IRulesObject, RequiredRule } from "@larascript-framework/larascript-validator";
import { HttpEnvironment } from "../http/environment/HttpEnvironment.js";
import { TestHttpEnvironment } from "./helpers/TestHttpEnvironment.js";
import { resetMockModelTable } from "./repository/resetMockModelTable.js";

const headers = {
    "Content-Type": "application/json",
}

describe("validator middleware test suite", () => {
    let httpService: IHttpService;
    let serverPort: number;
    let user: IUserModel;

    beforeEach(async () => {
        await TestHttpEnvironment.create().boot();

        httpService = HttpEnvironment.getInstance().httpService;

        await resetMockModelTable();

        user = await HttpEnvironment.getInstance().authEnvironment.userCreationService.createAndSave({
            email: 'test@test.com',
            password: 'password'
        })

        serverPort = httpService.getPort()!;
    });

    describe("validator middleware", () => {
        test("should pass when validation is successful", async () => {
            const controller = class extends Controller {
                async invoke(context: HttpContext) {
                    return this.jsonResponse({
                        message: 'Hello, world!',
                    })
                }
            }

            class validatorConstructor extends BaseCustomValidator {
                protected rules: IRulesObject = {
                    name: new RequiredRule(),
                }
            }

            const router = new HttpRouter();
            router.post('/test', controller, {
                middlewares: [
                    ValidatorMiddleware
                ],
                validator: [
                    validatorConstructor
                ],
            })
            httpService.useRouterAndApply(router);

            const response = await fetch(`http://localhost:${serverPort}/test`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    name: 'John Doe',
                }),
            })
            const body = await response.json() as { message: string };

            expect(response.status).toBe(200)
            expect(body).toEqual({
                message: 'Hello, world!',
            })
        })

        test("should fail when validation is unsuccessful", async () => {
            const controller = class extends Controller {
                async invoke(context: HttpContext) {
                    return this.jsonResponse({
                        message: 'Hello, world!',
                    })
                }
            }

            class validatorConstructor extends BaseCustomValidator {
                protected rules: IRulesObject = {
                    name: new RequiredRule(),
                }
            }

            const router = new HttpRouter();
            router.post('/test', controller, {
                middlewares: [
                    ValidatorMiddleware
                ],
                validator: [
                    validatorConstructor
                ],
            })
            httpService.useRouterAndApply(router);

            const response = await fetch(`http://localhost:${serverPort}/test`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    name: undefined,
                }),
            })
            const body = await response.json() as { errors: Record<string, string[]> };

            expect(response.status).toBe(HttpCodes.UNPROCESSABLE_ENTITY)
            expect(body.errors.name).toBeDefined()
        })

        test("should use database when validating", async () => {
            const controller = class extends Controller {
                async invoke(context: HttpContext) {
                    return this.jsonResponse({
                        message: 'Hello, world!',
                    })
                }
            }

            class validatorConstructor extends BaseCustomValidator {
                protected rules: IRulesObject = {
                    email: [new EmailRule(), new ExistsRule(User, 'email')],
                }
            }

            const router = new HttpRouter();
            router.post('/test', controller, {
                middlewares: [
                    ValidatorMiddleware
                ],
                validator: [
                    validatorConstructor
                ],
            })
            httpService.useRouterAndApply(router);

            const response = await fetch(`http://localhost:${serverPort}/test`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    email: 'test@test.com',
                }),
            })
            const body = await response.json() as { message: string };

            expect(response.status).toBe(HttpCodes.OK)
            expect(body.message).toBe('Hello, world!')
        })
    })

});
