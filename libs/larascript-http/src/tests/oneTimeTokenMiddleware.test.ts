import Controller from "@/http/base/Controller.js";
import HttpContext from "@/http/context/HttpContext.js";
import { OneTimeTokenMiddleware } from "@/http/middleware/OneTimeTokenMiddleware.js";
import HttpRouter from "@/http/router/HttpRouter.js";
import { beforeEach, describe } from "@jest/globals";
import { IUserModel } from "@larascript-framework/contracts/auth";
import { IHttpService } from "@larascript-framework/contracts/http";
import { HttpEnvironment } from "../http/environment/HttpEnvironment.js";
import { TestHttpEnvironment } from "./helpers/TestHttpEnvironment.js";
import { resetMockModelTable } from "./repository/resetMockModelTable.js";

const headers = {
    "Content-Type": "application/json",
}

describe("one time token middleware test suite", () => {
    let httpService: IHttpService;
    let serverPort: number;
    let user: IUserModel;
    let oneTimeToken: string;
    let jwt: string;

    beforeEach(async () => {
        await TestHttpEnvironment.create().boot();

        httpService = HttpEnvironment.getInstance().httpService;

        await resetMockModelTable();

        user = await HttpEnvironment.getInstance().authEnvironment.userCreationService.createAndSave({
            email: 'test@test.com',
            password: 'password'
        })

        oneTimeToken = await HttpEnvironment.getInstance().authService.getJwt().oneTimeService().createSingleUseToken(user, [], {
            expiresAfterMinutes: 60 * 24, // 24 hours
        });

        serverPort = httpService.getPort()!;
    });

    describe("one time token middleware", () => {
        test("should be able to validate a one time token", async () => {
            const controller = class extends Controller {
                async invoke(context: HttpContext) {
                    return this.jsonResponse({
                        message: 'Hello, world!',
                    })
                }
            }
            const router = new HttpRouter();
            router.get('/test', controller, {
                middlewares: [
                    OneTimeTokenMiddleware
                ]
            })
            httpService.useRouterAndApply(router);

            const response = await fetch(`http://localhost:${serverPort}/test`, {
                headers: {
                    'Authorization': `Bearer ${oneTimeToken}`
                }
            })
            const body = await response.json() as { message: string };

            expect(response.status).toBe(200);
            expect(body.message).toBe('Hello, world!');

            const response2 = await fetch(`http://localhost:${serverPort}/test`, {
                headers: {
                    'Authorization': `Bearer ${oneTimeToken}`
                }
            })
            expect(response2.status).toBe(401);
        })
    });
});
