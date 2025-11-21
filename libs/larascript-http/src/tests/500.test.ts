import Controller from "@/http/base/Controller.js";
import HttpRouter from "@/http/router/HttpRouter.js";
import { describe } from "@jest/globals";
import { NextFunction, Request, Response } from "express";
import { HttpEnvironment } from "../http/environment/HttpEnvironment.js";
import { TestHttpEnvironment } from "./helpers/TestHttpEnvironment.js";

const headers = {
    "Content-Type": "application/json",
}

describe("500 test suite", () => {
    describe("error handlers", () => {
        test("should return a 500 error when a route is not found", async () => {
            TestHttpEnvironment.create()
                .withEnableErrorHandlers()
                .createHttpService()

            const controller = class extends Controller {
                invoke() {
                    throw new Error('Test error');
                }
            }

            const router = new HttpRouter();
            router.get('/error', controller);

            HttpEnvironment.getInstance().httpService.useRouter(router);
            await TestHttpEnvironment.getInstance().boot();

            const response = await fetch(`${TestHttpEnvironment.getBaseUrl()}/error`, {
                method: 'GET',
                headers: headers,
            });

            const body = await response.json() as { error: string, stack: string[] };

            expect(response.status).toBe(500);
            expect(body.error).toBe('Test error');
            expect(body.stack).toBeDefined();
        })

        test("should return a customized 500 error when configured", async () => {
            TestHttpEnvironment.create()
            .withHttpServiceConfig({
                errorHandlers: {
                    errorHandler: (err: Error, req: Request, res: Response, next: NextFunction) => {
                        res.status(500).send({ error: 'Custom 500 error' });
                    },
                },
            })

            const router = new HttpRouter();
            router.get('/error', (req: Request, res: Response, next?: NextFunction) => {
                throw new Error('Test error');
            });

            HttpEnvironment.getInstance().httpService.useRouter(router);
            await TestHttpEnvironment.getInstance().boot();

            const response = await fetch(`${TestHttpEnvironment.getBaseUrl()}/error`, {
                method: 'GET',
                headers: headers,
            });
            const body = await response.json() as { error: string };

            expect(response.status).toBe(500);
            expect(body.error).toBe('Custom 500 error');
        })
    });
});
