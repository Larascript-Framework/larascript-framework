import IsNumber from "@/validator/rules/NumberRule.js";
import Validator from "@/validator/service/Validator.js";
import { describe } from "@jest/globals";

describe("test validation", () => {
  test("isNumber, passes", async () => {
    const validator = Validator.make({
      numberField: [new IsNumber()],
    });

    const result = await validator.validate({
      numberField: 123,
    });

    expect(result.passes()).toBe(true);
  });

  test("isNumber, fails with non-number value", async () => {
    const validator = Validator.make({
      numberField: [new IsNumber()],
    });

    const result = await validator.validate({
      objectField: "non-number",
    });

    expect(result.passes()).toBe(false);
  });
});
