import { describe } from "@jest/globals";
import { TestHttpEnvironment } from "./helpers/TestHttpEnvironment.js";

const headers = {
    "Content-Type": "application/json",
}

describe("404 test suite", () => {
    describe("error handlers", () => {
        test("should return a 404 error when a route is not found", async () => {
            await TestHttpEnvironment.create()
            .withEnableErrorHandlers()
            .createHttpService()
            .boot();

            const response = await fetch(`${TestHttpEnvironment.getBaseUrl()}/not-found`, {
                method: 'GET',
                headers: headers,
            });
            const body = await response.json() as { error: string };

            expect(response.status).toBe(404);
            expect(body.error).toBe('Invalid route');
        })

        test("should return a customized 404 error when configured", async () => {
            await TestHttpEnvironment.create()
            .withEnableErrorHandlers()
            .withHttpServiceConfig({
                errorHandlers: {
                    notFoundHandler: (req, res, next) => {
                        res.status(404).send({ error: 'Custom 404 error' });
                    },
                },
            })
            .boot();

            const response = await fetch(`${TestHttpEnvironment.getBaseUrl()}/not-found`, {
                method: 'GET',
                headers: headers,
            });
            const body = await response.json() as { error: string };

            expect(response.status).toBe(404);
            expect(body.error).toBe('Custom 404 error');
        })
    });
});
