import { DatabaseResourceRepository } from "@/http/resources/repository/DatabaseResourceRepository.js";
import HttpRouter from "@/http/router/HttpRouter.js";
import { beforeEach, describe, test } from "@jest/globals";
import { TestHttpEnvironment } from "./helpers/TestHttpEnvironment.js";
import { MockModel } from "./repository/MockModel.js";

describe("config optional database test suite", () => {
    beforeEach(async () => {
        await TestHttpEnvironment.create({
            databaseConfigured: false,
        }).boot();
    });

    describe("optional database dependencies", () => {
        test("should get an error if a model constructor is provided but the database dependencies are not configured", async () => {
            const router = new HttpRouter();

            expect(() =>
                router.resource({
                    prefix: '/test',
                    datasource: {
                        modelConstructor: MockModel,
                    }
                })
            ).toThrow('Database is not configured. Use a repository instead.');
        })

        test("should not throw an error if a repository is provided", async () => {
            const router = new HttpRouter();

            expect(() =>
                router.resource({
                    prefix: '/test',
                    datasource: {
                        repository: new DatabaseResourceRepository({
                            modelConstructor: MockModel,
                        }),
                    }
                })
            ).not.toThrow();
        })
    })
});
