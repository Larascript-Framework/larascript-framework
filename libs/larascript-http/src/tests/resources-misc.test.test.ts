import HttpCodes from "@/http/data/HttpCodes.js";
import HttpRouter from "@/http/router/HttpRouter.js";
import QueryFilters from "@/http/utils/QueryFilters.js";
import { beforeEach, describe, test } from "@jest/globals";
import { IUserModel } from "@larascript-framework/contracts/auth";
import { IHttpService, MiddlewareConstructor, QueryFilterOptions } from "@larascript-framework/contracts/http";
import { Request } from "express";
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

    describe("sensitive data", () => {
        test("should not show sensitive data in create response", async () => {
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

            const response = await fetch(`http://localhost:${serverPort}/test`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    name: 'Test',
                    age: 20,
                    secret: 'Secret',
                }),
            })

            const body = await response.json() as {
                data: {
                    id: string,
                    name: string,
                    secret?: string,
                }
            }

            expect(response.status).toBe(HttpCodes.CREATED)
            expect(body.data.secret).toBeUndefined();
        })

        test("should not show sensitive data in show response", async () => {
            const model = await MockModel.create({
                name: 'Test',
                age: 20,
                secret: 'Secret',
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
                    secret?: string,
                }
            }

            expect(response.status).toBe(HttpCodes.OK)
            expect(body.data.secret).toBeUndefined();
        })

        test("should not show sensitive data in update response", async () => {
            const model = await MockModel.create({
                name: 'Test',
                age: 20,
                secret: 'Secret',
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
                    age: 20,
                    secret: 'Secret Updated',
                }),
            })

            const body = await response.json() as {
                data: {
                    id: string,
                    name: string,
                    secret?: string,
                }
            }

            expect(response.status).toBe(HttpCodes.OK)
            expect(body.data.secret).toBeUndefined();
        })

        test("should not show sensitive data in index response", async () => {
            const model = await MockModel.create({
                name: 'Test',
                age: 20,
                secret: 'Secret',
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

            const response = await fetch(`http://localhost:${serverPort}/test`, {
                method: 'GET',
                headers,
            })

            const body = await response.json() as {
                data: {
                    id: string,
                    name: string,
                    secret?: string,
                }[]
            }

            expect(response.status).toBe(HttpCodes.OK)
            expect(body.data.length).toBe(1)
            expect(body.data[0].secret).toBeUndefined();
        })
    })

    describe("meta data", () => {
        test("should include totalCount in index response", async () => {
            const model = await MockModel.create({
                name: 'Test',
                age: 20,
                secret: 'Secret',
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

            const response = await fetch(`http://localhost:${serverPort}/test`, {
                method: 'GET',
                headers,
            })

            const body = await response.json() as {
                meta: {
                    totalCount: number,
                }
            }

            expect(response.status).toBe(HttpCodes.OK)
            expect(body.meta.totalCount).toBe(1)
        })

        test("should include pagination metadata in index response", async () => {
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

            const response = await fetch(`http://localhost:${serverPort}/test`, {
                method: 'GET',
                headers,
            })

            const body = await response.json() as {
                meta: {
                    pagination: {
                        page: number,
                        pageSize: number,
                        nextPage: number,
                        previousPage: number,
                    }
                }
            }

            expect(response.status).toBe(HttpCodes.OK)
            expect(body.meta.pagination.page).toBe(1)
            expect(body.meta.pagination.pageSize).toBe(10)
        })
    })

    describe("pagination", () => {
        test("request page size override should not be allowed", async () => {
            const router = new HttpRouter();
            router.resource({
                prefix: '/test',
                datasource: {
                    modelConstructor: MockModel,
                },
                paginate: {
                    pageSize: 10,
                    allowPageSizeOverride: false,
                },
                middlewares: [
                    MockAuthorizeMiddleware,
                ]
            })
            httpService.useRouterAndApply(router);

            const response = await fetch(`http://localhost:${serverPort}/test?page=1&pageSize=2`, {
                method: 'GET',
                headers,
            })

            const body = await response.json() as {
                data: [],
                meta: {
                    pagination: {
                        page: number,
                        pageSize: number,
                    }
                }
            }

            expect(response.status).toBe(HttpCodes.OK)
            expect(body.meta.pagination.pageSize).toBe(10)
        })

        test("large page numbers beyond available results should return empty array", async () => {
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

            const response = await fetch(`http://localhost:${serverPort}/test?page=100`, {
                method: 'GET',
                headers,
            })

            const body = await response.json() as {
                data: [],
                meta: {
                    pagination: {
                        page: number,
                        pageSize: number,
                        nextPage: number,
                        previousPage: number,
                    }
                }
            }

            expect(response.status).toBe(HttpCodes.OK)
            expect(body.data).toEqual([])
            expect(body.meta.pagination.page).toBe(100)
            expect(body.meta.pagination.previousPage).toBe(99)
            expect(body.meta.pagination.nextPage).toBe(undefined)
        })
    })

    describe("query filters", () => {
        test("should filter out fields that are not in the allowed fields", async () => {
            const options: QueryFilterOptions = {
                baseFilters: {
                    name: 'Test',
                    age: 20,
                },
                allowedFields: ['name', 'age'],
            }

            const mockRequest = {
                query: {
                    filters: {
                        name: 'Test',
                        age: 20,
                        secret: 'Secret',
                    },
                },
            } as unknown as Request;

            const queryFilters = QueryFilters.parseRequest(mockRequest, options).filters;

            expect(queryFilters).toEqual({
                name: 'Test',
                age: 20,
            });

        })

        test("should add percent signs to filters if fuzzy is true", async () => {
            const options: QueryFilterOptions = {
                fuzzy: true,
                baseFilters: {
                    name: 'Test',
                }
            }

            const mockRequest = {
                query: {
                    filters: {
                        name: 'Test',
                    },
                },
            } as unknown as Request;

            const queryFilters = QueryFilters.parseRequest(mockRequest, options).filters;

            expect(queryFilters).toEqual({
                name: '%Test%',
            });
        })

        test("should not add percent signs to filters if fuzzy is false", async () => {
            const options: QueryFilterOptions = {
                fuzzy: false,
                baseFilters: {
                    name: 'Test',
                },
            }

            const mockRequest = {
                query: {
                    filters: {
                        name: 'Test',
                    },
                },
            } as unknown as Request;

            const queryFilters = QueryFilters.parseRequest(mockRequest, options).filters;

            expect(queryFilters).toEqual({
                name: 'Test',
            });
        })

        test("should merge base filters with request filters", async () => {
            const options: QueryFilterOptions = {
                baseFilters: {
                    name: 'Test',
                },
            }

            const mockRequest = {
                query: {
                    filters: {
                        age: 20,
                    },
                },
            } as unknown as Request;

            const queryFilters = QueryFilters.parseRequest(mockRequest, options).filters;

            expect(queryFilters).toEqual({
                name: 'Test',
                age: 20,
            });
        })
    })
});
