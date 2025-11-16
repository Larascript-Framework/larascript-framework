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

describe("resources indexes test suite", () => {
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

    describe("index resource", () => {
        test("should be able to index a resource while authenticated", async () => {
            const model = await MockModel.create({
                name: 'Test',
                age: 20,
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
                    age: number
                }[]
            }

            expect(response.status).toBe(HttpCodes.OK)
            expect(body.data.length).toBe(1)
            expect(body.data[0].id).toBe(model.getId())
            expect(body.data[0].name).toBe(model.name)
            expect(body.data[0].age).toBe(model.age)
        })

        test("should not be able to index a resource while not being authenticated", async () => {
            const model = await MockModel.create({
                name: 'Test',
                age: 20,
            });
            await model.save();

            const router = new HttpRouter();
            router.resource({
                prefix: '/test',
                datasource: {
                    modelConstructor: MockModel,
                },
            })
            httpService.useRouterAndApply(router);

            const response = await fetch(`http://localhost:${serverPort}/test`, {
                method: 'GET',
                headers,
            })

            expect(response.status).toBe(HttpCodes.UNAUTHORIZED)
        })

        test("should not be able to index a resource if it is not owned by the user", async () => {
            const model = await MockModel.create({
                name: 'Test',
                age: 20,
                userId: generateUuidV4()
            });
            await model.save();

            const router = new HttpRouter();
            router.resource({
                prefix: '/test',
                datasource: {
                    modelConstructor: MockModel,
                },
                security: [
                    router.security().resourceOwner('userId'),
                ],
                middlewares: [
                    MockAuthorizeMiddleware,
                ],
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
                    age: number
                }[]
            }

            expect(response.status).toBe(HttpCodes.OK)
            expect(body.data.length).toBe(0)
        })

        test("should be able to index a resource if it is owned by the user", async () => {
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
                security: [
                    router.security().resourceOwner('userId'),
                ],
                middlewares: [
                    MockAuthorizeMiddleware,
                ],
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
                    age: number,
                    userId: string
                }[]
            }

            expect(response.status).toBe(HttpCodes.OK)
            expect(body.data.length).toBe(1)
            expect(body.data[0].id).toBe(model.getId())
            expect(body.data[0].name).toBe(model.name)
            expect(body.data[0].age).toBe(model.age)
            expect(body.data[0].userId).toBe(user.getId())
        })

        test("should not apply resource owner filter if the user is not authenticated", async () => {
            const model = await MockModel.create({
                name: 'Test',
                age: 20,
                userId: generateUuidV4(),
            });
            await model.save();

            const router = new HttpRouter();
            router.resource({
                prefix: '/test',
                datasource: {
                    modelConstructor: MockModel,
                },
                allowUnauthenticated: true,
                security: [
                    router.security().resourceOwner('userId'),
                ],
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
                    age: number
                }[]
            }

            expect(response.status).toBe(HttpCodes.OK)
            expect(body.data.length).toBe(1)
            expect(body.data[0].id).toBe(model.getId())
            expect(body.data[0].name).toBe(model.name)
            expect(body.data[0].age).toBe(model.age)

        })

        test("should be able to filter resources using exact match", async () => {
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
                searching: {
                    fuzzy: false,
                    fields: ['name'],
                }
            })
            httpService.useRouterAndApply(router);

            const queryParams = '?filters[name]=Test';
            const response = await fetch(`http://localhost:${serverPort}/test${queryParams}`, {
                method: 'GET',
                headers,
            })
            const body = await response.json() as {
                data: {
                    id: string,
                    name: string,
                    age: number,
                    userId: string
                }[]
            }

            expect(response.status).toBe(HttpCodes.OK)
            expect(body.data.length).toBe(1)
            expect(body.data[0].id).toBe(model.getId())
            expect(body.data[0].name).toBe(model.name)
            expect(body.data[0].age).toBe(model.age)
            expect(body.data[0].userId).toBe(user.getId())
        })

        test("should be able to fuzzy match filter", async () => {
            const model = await MockModel.create({
                name: 'John Doe',
                age: 20
            });
            const model2 = await MockModel.create({
                name: 'Jane Smith',
                age: 20
            });
            const model3 = await MockModel.create({
                name: 'John Smith',
                age: 20
            });
            await model.save();
            await model2.save();
            await model3.save();

            const router = new HttpRouter();
            router.resource({
                prefix: '/test',
                datasource: {
                    modelConstructor: MockModel,
                },
                middlewares: [
                    MockAuthorizeMiddleware,
                ],
                searching: {
                    fuzzy: true,
                    fields: ['name'],
                }
            })
            httpService.useRouterAndApply(router);

            const queryParams = '?filters[name]=Jane';
            const response = await fetch(`http://localhost:${serverPort}/test${queryParams}`, {
                method: 'GET',
                headers,
            })
            const body = await response.json() as {
                data: {
                    id: string,
                    name: string,
                    age: number,
                    userId: string
                }[]
            }

            expect(response.status).toBe(HttpCodes.OK)
            expect(body.data.length).toBe(1)
            expect(body.data[0].name).toBe(model2.name)

            const queryParams2 = '?filters[name]=Smith';
            const response2 = await fetch(`http://localhost:${serverPort}/test${queryParams2}`, {
                method: 'GET',
                headers,
            })
            const body2 = await response2.json() as {
                data: {
                    id: string,
                    name: string,
                    age: number,
                    userId: string
                }[]
            }

            expect(response2.status).toBe(HttpCodes.OK)
            expect(body2.data.length).toBe(2)
            expect(body2.data[0].name).toBe(model2.name)
            expect(body2.data[1].name).toBe(model3.name)
        })

        test("should be able to paginate resources", async () => {
            const model = await MockModel.create({
                name: 'John Doe',
                age: 20
            });
            const model2 = await MockModel.create({
                name: 'Jane Smith',
                age: 20
            });
            await model.save();
            await model2.save();

            const router = new HttpRouter();
            router.resource({
                prefix: '/test',
                datasource: {
                    modelConstructor: MockModel,
                },
                middlewares: [
                    MockAuthorizeMiddleware,
                ],
                paginate: {
                    pageSize: 1,
                    allowPageSizeOverride: true,
                }
            })
            httpService.useRouterAndApply(router);

            const queryParams = '?page=1&pageSize=1';
            const response = await fetch(`http://localhost:${serverPort}/test${queryParams}`, {
                method: 'GET',
                headers,
            })
            const body = await response.json() as {
                data: {
                    id: string,
                    name: string,
                    age: number,
                    userId: string
                }[]
            }

            expect(response.status).toBe(HttpCodes.OK)
            expect(body.data.length).toBe(1)

            const queryParams2 = '?page=2&pageSize=1';
            const response2 = await fetch(`http://localhost:${serverPort}/test${queryParams2}`, {
                method: 'GET',
                headers,
            })
            const body2 = await response2.json() as {
                data: {
                    id: string,
                    name: string,
                    age: number,
                    userId: string
                }[]
            }

            expect(response2.status).toBe(HttpCodes.OK)
            expect(body2.data.length).toBe(1)
            expect(body2.data[0].name).toBe(model2.name)
        })

        test("should be able to override the page size", async () => {
            const model = await MockModel.create({
                name: 'John Doe',
                age: 20
            });
            const model2 = await MockModel.create({
                name: 'Jane Smith',
                age: 20
            });
            await model.save();
            await model2.save();

            const router = new HttpRouter();
            router.resource({
                prefix: '/test',
                datasource: {
                    modelConstructor: MockModel,
                },
                middlewares: [
                    MockAuthorizeMiddleware,
                ],
                paginate: {
                    pageSize: 1,
                    allowPageSizeOverride: true,
                }
            })
            httpService.useRouterAndApply(router);

            const queryParams = '?page=1&pageSize=2';
            const response = await fetch(`http://localhost:${serverPort}/test${queryParams}`, {
                method: 'GET',
                headers,
            })
            const body = await response.json() as {
                data: {
                    id: string,
                    name: string,
                    age: number,
                    userId: string
                }[]
            }

            expect(response.status).toBe(HttpCodes.OK)
            expect(body.data.length).toBe(2)
            expect(body.data[0].name).toBe(model.name)
            expect(body.data[1].name).toBe(model2.name)
        })

        test("should be able to sort resources", async () => {
            const model = await MockModel.create({
                name: 'Alice',
                age: 20
            });
            const model2 = await MockModel.create({
                name: 'Bob',
                age: 20
            });
            await model.save();
            await model2.save();

            const router = new HttpRouter();
            router.resource({
                prefix: '/test',
                datasource: {
                    modelConstructor: MockModel,
                },
                middlewares: [
                    MockAuthorizeMiddleware,
                ],
                sorting: {
                    defaultField: 'name',
                    defaultDirection: 'asc',
                }
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
                    age: number,
                    userId: string
                }[]
            }

            expect(response.status).toBe(HttpCodes.OK)
            expect(body.data.length).toBe(2)
            expect(body.data[0].name).toBe('Alice')
            expect(body.data[1].name).toBe('Bob')

            const queryParams = '?sort[name]=desc';
            const response2 = await fetch(`http://localhost:${serverPort}/test${queryParams}`, {
                method: 'GET',
                headers,
            })
            const body2 = await response2.json() as {
                data: {
                    id: string,
                    name: string,
                    age: number,
                    userId: string
                }[]
            }

            expect(response2.status).toBe(HttpCodes.OK)
            expect(body2.data.length).toBe(2)
            expect(body2.data[0].name).toBe('Bob')
            expect(body2.data[1].name).toBe('Alice')
        })

        test('should be able to override the default field and direction', async () => {
            const model = await MockModel.create({
                name: 'Alice',
                age: 20
            });
            const model2 = await MockModel.create({
                name: 'Bob',
                age: 21
            });
            await model.save();
            await model2.save();

            const router = new HttpRouter();
            router.resource({
                prefix: '/test',
                datasource: {
                    modelConstructor: MockModel,
                },
                middlewares: [
                    MockAuthorizeMiddleware,
                ],
                sorting: {
                    defaultField: 'name',
                    defaultDirection: 'asc',
                }
            })
            httpService.useRouterAndApply(router);

            const queryParams = '?sort[age]=asc';
            const response = await fetch(`http://localhost:${serverPort}/test${queryParams}`, {
                method: 'GET',
                headers,
            })
            const body = await response.json() as {
                data: {
                    id: string,
                    name: string,
                    age: number,
                    userId: string
                }[]
            }

            expect(response.status).toBe(HttpCodes.OK)
            expect(body.data.length).toBe(2)
            expect(body.data[0].age).toBe(20)
            expect(body.data[1].age).toBe(21)

            const queryParams2 = '?sort[age]=desc';
            const response2 = await fetch(`http://localhost:${serverPort}/test${queryParams2}`, {
                method: 'GET',
                headers,
            })
            const body2 = await response2.json() as {
                data: {
                    id: string,
                    name: string,
                    age: number,
                    userId: string
                }[]
            }

            expect(response2.status).toBe(HttpCodes.OK)
            expect(body2.data.length).toBe(2)
            expect(body2.data[0].age).toBe(21)
            expect(body2.data[1].age).toBe(20)
        })        
    })

});
