import AcceptedRule from "@/validator/rules/AcceptedRule.js";
import Validator from "@/validator/service/Validator.js";
import { describe } from "@jest/globals";

describe("test validation", () => {
  test("accepted", async () => {
    const validAcceptedValues = [
      { accepted: "yes" },
      { accepted: "on" },
      { accepted: 1 },
      { accepted: "1" },
      { accepted: true },
      { accepted: "true" },
    ];

    for (const data of validAcceptedValues) {
      const goodValidator = Validator.make({
        accepted: new AcceptedRule(),
      });
      const good = await goodValidator.validate(data);

      expect(good.passes()).toBe(true);
      expect(Object.keys(good.errors() || {}).length).toBe(0);

      const badValidator = Validator.make({
        accepted: new AcceptedRule(),
      });
      const bad = await badValidator.validate({
        accepted: false,
      });

      expect(bad.passes()).toBe(false);
      expect(Object.keys(bad.errors() || {}).length).toBe(1);
      expect(bad.errors()).toEqual({
        accepted: ["The accepted field must be accepted."],
      });
    }
  });
});
