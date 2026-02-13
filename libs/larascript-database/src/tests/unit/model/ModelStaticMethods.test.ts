import { Model } from "@/model/index.js";
import { testHelper } from "@/tests/tests-helper/testHelper.js";
import { TCastableType } from "@larascript-framework/cast-js";

export type TestModelAttributes = {
    name: string;
    age: number;
};

class TestModel extends Model<TestModelAttributes> {
    casts: Record<string, TCastableType> = {
        name: "string",
        age: "number",
    };
}

describe("Model Static Methods", () => {

    beforeAll(async () => {
        await testHelper.testBootApp();
    });

    describe("getCasts", () => {
        it("should return the casts for the model", () => {
            const casts = TestModel.getCasts();

            expect(casts).toEqual({
                name: "string",
                age: "number",
            });
        });
    });
});