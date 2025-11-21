import CsrfMiddleware from "@/http/middleware/CsrfMiddlware.js";
import HttpRouter from "@/http/router/HttpRouter.js";
import { beforeEach, describe } from "@jest/globals";
import { IHttpService } from "@larascript-framework/contracts/http";
import { HttpEnvironment } from "../http/environment/HttpEnvironment.js";
import { TestHttpEnvironment } from "./helpers/TestHttpEnvironment.js";

const headers = {
    "Content-Type": "application/json",
}

describe("csrf middleware test suite", () => {
    let httpService: IHttpService;
    let serverPort: number;
    
    beforeEach(async () => {
        await TestHttpEnvironment.create().withCsrf().boot();

        httpService = HttpEnvironment.getInstance().httpService;

        serverPort = httpService.getPort()!;
    });

    describe("csrf middleware", () => {
        test("should be able to generate a csrf token", async () => {
            httpService.useRouterAndApply(CsrfMiddleware.getRouter());

            const response = await fetch(`http://localhost:${serverPort}/csrf`, {
                method: 'GET',
                headers: headers,
            });
            const body = await response.json() as { 
                data: {
                    token: string;
                }
             };

            expect(response.status).toBe(200);
            expect(body.data.token).toBeDefined();
        })

        test("should be able to access a route that is protected by csrf", async () => {
            httpService.useRouterAndApply(CsrfMiddleware.getRouter());

            const router = new HttpRouter();
            router.post('/test', (req, res) => {
                res.json({
                    message: 'Hello, world!',
                });
            });
            httpService.useRouterAndApply(router);

            const responseToken = await fetch(`http://localhost:${serverPort}/csrf`, {
                method: 'GET',
                headers: headers,
            });
            const bodyToken = await responseToken.json() as { 
                data: {
                    token: string;
                }
            };
            const token = bodyToken.data.token;

            expect(token).toBeDefined();

            const response = await fetch(`http://localhost:${serverPort}/test`, {
                method: 'POST',
                headers: {
                    ...headers,
                    'X-CSRF-TOKEN': token,
                },
            });
            const body = await response.json() as { message: string };

            expect(response.status).toBe(200);
            expect(body.message).toBe('Hello, world!');
        })

        test("should not be able to access a route that is protected by csrf without a csrf token", async () => {
            const router = new HttpRouter();
            router.post('/test', (req, res) => {
                res.json({
                    message: 'Hello, world!',
                });
            });
            httpService.useRouterAndApply(router);

            const response = await fetch(`http://localhost:${serverPort}/test`, {
                method: 'POST',
                headers: {
                    ...headers,
                },
            });
            const body = await response.json() as { error: string };

            expect(response.status).toBe(403);
            expect(body.error).toBe('Invalid CSRF token');
        })
    });
});
