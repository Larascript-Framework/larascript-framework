import { queryBuilder } from "@/core/services/QueryBuilder.js";
import TestEmailModel, {
  resetEmailTable,
} from "@/tests/larascript/eloquent/models/TestEmailModel.js";
import testHelper from "@/tests/testHelper.js";
import { describe } from "@jest/globals";
import {
  EmailRule,
  ExistsRule,
  RequiredRule,
  Validator,
} from "@larascript-framework/larascript-validator";

describe("test validation", () => {
  const email = "test@test.com";

  beforeAll(async () => {
    await testHelper.testBootApp();
  });

  test("email is exists, passes", async () => {
    await resetEmailTable();

    await queryBuilder(TestEmailModel).insert({
      email,
    });

    const validator = Validator.make({
      email: [
        new RequiredRule(),
        new EmailRule(),
        new ExistsRule(TestEmailModel, "email"),
      ],
    });
    const result = await validator.validate({
      email,
    });

    expect(result.passes()).toBe(true);
  });

  test("email does not exist, fails", async () => {
    await resetEmailTable();

    const validator = Validator.make({
      email: [
        new RequiredRule(),
        new EmailRule(),
        new ExistsRule(TestEmailModel, "email"),
      ],
    });
    const result = await validator.validate({
      email,
    });

    expect(result.fails()).toBe(true);
    expect(result.errors()).toEqual({
      email: ["The email field must exist."],
    });
  });

  test("email does not exist, with custom message", async () => {
    await resetEmailTable();

    const validator = Validator.make(
      {
        email: [
          new RequiredRule(),
          new EmailRule(),
          new ExistsRule(TestEmailModel, "email"),
        ],
      },
      {
        "email.exists": "The email does not exist.",
      },
    );
    const result = await validator.validate({
      email,
    });

    expect(result.passes()).toBe(false);
    expect(result.errors()).toEqual({
      email: ["The email does not exist."],
    });
  });
});
