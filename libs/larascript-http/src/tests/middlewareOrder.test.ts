import Middleware from "@/http/base/Middleware.js";
import HttpContext from "@/http/context/HttpContext.js";
import HttpRouter from "@/http/router/HttpRouter.js";
import { beforeEach, describe, expect, test } from "@jest/globals";
import { IHttpService, MiddlewareConstructor } from "@larascript-framework/contracts/http";
import { BaseSingleton } from "@larascript-framework/larascript-core";
import { Request, Response } from "express";
import { HttpEnvironment } from "../http/environment/HttpEnvironment.js";
import { TestHttpEnvironment } from "./helpers/TestHttpEnvironment.js";

class MiddlewareSingleton extends BaseSingleton {
    counter = 0;
    counterWithLabel: Record<string, number> = {}

    setLabelWithCurrentCounter(label: string) {
        this.counterWithLabel[label] = this.counter;
    }

    updateCounter() {
        this.counter++;
    }

    getCounter() {
        return this.counter;
    }

    resetCounter() {
        this.counter = 0;
    }
}

describe("httpService test suite", () => {
    let httpService: IHttpService;
    let beforeAllMiddleware: MiddlewareConstructor;
    let requestMiddleware: MiddlewareConstructor;
    let afterAllMiddleware: MiddlewareConstructor;

    beforeEach(async () => {
        beforeAllMiddleware = class extends Middleware {
            async execute(context: HttpContext) {
                MiddlewareSingleton.getInstance().updateCounter();
                MiddlewareSingleton.getInstance().setLabelWithCurrentCounter('beforeAllMiddleware');
                this.next();
            }
        }
        requestMiddleware = class extends Middleware {
            async execute(context: HttpContext) {
                MiddlewareSingleton.getInstance().updateCounter();
                MiddlewareSingleton.getInstance().setLabelWithCurrentCounter('requestMiddleware');
                this.next();
            }
        }
        afterAllMiddleware = class extends Middleware {
            async execute(context: HttpContext) {
                MiddlewareSingleton.getInstance().updateCounter();
                MiddlewareSingleton.getInstance().setLabelWithCurrentCounter('afterAllMiddleware');
                this.next();
            }
        }
        
        await TestHttpEnvironment.create()
        .withHttpServiceConfig({
            beforeAllMiddlewares: [beforeAllMiddleware],
            afterAllMiddlewares: [afterAllMiddleware],
        })
        .boot();

        httpService = HttpEnvironment.getInstance().httpService;
        MiddlewareSingleton.getInstance().resetCounter();
    });


    describe('middleware', () => {
        test.only("middlewares should be executed in the correct order", async () => {
            const router = new HttpRouter();
            router.get('/test', (req: Request, res: Response) => {
                res.send({
                    message: 'test',
                });
            }, {
                middlewares: [requestMiddleware],
            });
            httpService.useRouterAndApply(router);

            const response = await fetch(`${TestHttpEnvironment.getBaseUrl()}/test`, {
                method: 'GET',
            });
            const body = await response.json() as { message: string };

            expect(response.status).toBe(200);
            expect(body.message).toBe('test');
            expect(MiddlewareSingleton.getInstance().counterWithLabel).toEqual({
                beforeAllMiddleware: 1,
                requestMiddleware: 2,
                afterAllMiddleware: 3,
            });
        })
    })
});
