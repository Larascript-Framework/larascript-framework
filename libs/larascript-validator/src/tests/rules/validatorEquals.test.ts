import EqualsRule from "@/validator/rules/EqualsRule.js";
import Validator from "@/validator/service/Validator.js";
import { describe } from "@jest/globals";

describe("test validation", () => {
  test("equals, passes", async () => {
    const validAcceptedValues = [
      { equalsField: "hello world" },
      { equalsField: 123 },
      { equalsField: true },
      { equalsField: "true" },
    ];

    for (const data of validAcceptedValues) {
      const goodValidator = Validator.make({
        equalsField: new EqualsRule(data.equalsField),
      });
      const good = await goodValidator.validate(data);

      expect(good.passes()).toBe(true);
      expect(Object.keys(good.errors() || {}).length).toBe(0);
    }
  });

  test("equals, fails", async () => {
    const badValidator = Validator.make({
      equalsField: new EqualsRule("non matching value"),
    });
    const bad = await badValidator.validate({
      equalsField: "hello world",
    });

    expect(bad.passes()).toBe(false);
    expect(Object.keys(bad.errors() || {}).length).toBe(1);
    expect(bad.errors()).toEqual({
      equalsField: [
        "The equalsField field must be equal to non matching value.",
      ],
    });
  });
});
