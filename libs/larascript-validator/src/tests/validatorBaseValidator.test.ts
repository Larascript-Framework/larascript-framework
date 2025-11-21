import {
  ArrayRule,
  BaseCustomValidator,
  IRulesObject,
  MinRule,
  ObjectRule,
  RequiredRule,
  StringRule,
} from "@/validator/index.js";
import { describe } from "@jest/globals";

class CustomValidator extends BaseCustomValidator {
  protected rules: IRulesObject = {
    name: [new RequiredRule(), new StringRule(), new MinRule(3)],
  };

  protected messages: Record<string, string> = {
    "name.required": "Name is required",
    "name.string": "Name must be a string",
    "name.min": "Name must be at least 3 characters long",
  };
}

class AdvancedValidator extends BaseCustomValidator {
  protected rules: IRulesObject = {
    name: [new RequiredRule(), new StringRule(), new MinRule(3)],
    age: [new RequiredRule()],
    profile: [new RequiredRule(), new ObjectRule()],
    "profile.bio": [new StringRule(), new MinRule(10)],
    hobbies: [new RequiredRule(), new ArrayRule()],
  };

  protected messages: Record<string, string> = {
    "name.required": "Name is required",
    "name.string": "Name must be a string",
    "name.min": "Name must be at least 3 characters long",
    "age.required": "Age is required",
    "profile.required": "Profile is required",
    "profile.object": "Profile must be an object",
    "profile.bio.string": "Bio must be a string",
    "profile.bio.min": "Bio must be at least 10 characters long",
    "hobbies.required": "Hobbies are required",
    "hobbies.array": "Hobbies must be an array",
  };
}

describe("test validation", () => {
  test("custom validator passes", async () => {
    const validator = new CustomValidator();
    const result = await validator.validate({
      name: "John",
    });

    expect(result.passes()).toBe(true);
  });

  test("custom validator fails", async () => {
    const validator = new CustomValidator();
    const result = await validator.validate({
      name: "Jo",
    });

    expect(result.passes()).toBe(false);
    expect(result.errors()).toEqual({
      name: ["Name must be at least 3 characters long"],
    });
  });

  describe("advanced validation scenarios", () => {
    test("validates nested objects successfully", async () => {
      const validator = new AdvancedValidator();
      const result = await validator.validate({
        name: "John",
        age: 25,
        profile: {
          bio: "This is my biography that is long enough",
        },
        hobbies: ["reading", "gaming"],
      });

      expect(result.passes()).toBe(true);
      expect(result.errors()).toEqual({});
    });

    test("fails with multiple validation errors", async () => {
      const validator = new AdvancedValidator();
      const result = await validator.validate({
        name: "Jo",
        profile: {
          bio: "Short",
        },
        hobbies: "not an array",
      });

      expect(result.passes()).toBe(false);
      expect(result.errors()).toEqual({
        name: ["Name must be at least 3 characters long"],
        age: ["Age is required"],
        "profile.bio": ["Bio must be at least 10 characters long"],
        hobbies: ["Hobbies must be an array"],
      });
    });

    test("validates array field correctly", async () => {
      const validator = new AdvancedValidator();
      const result = await validator.validate({
        name: "John",
        age: 25,
        profile: {
          bio: "This is my biography that is long enough",
        },
        hobbies: null,
      });

      expect(result.passes()).toBe(false);
      expect(result.errors()).toEqual({
        hobbies: ["Hobbies are required", "Hobbies must be an array"],
      });
    });

    test("validates nested object field correctly", async () => {
      const validator = new AdvancedValidator();
      const result = await validator.validate({
        name: "John",
        age: 25,
        profile: "not an object",
        hobbies: ["reading"],
      });

      expect(result.passes()).toBe(false);
      expect(result.errors()).toEqual({
        profile: ["Profile must be an object"],
        "profile.bio": [
          "Bio must be a string",
          "Bio must be at least 10 characters long",
        ],
      });
    });
  });
});
