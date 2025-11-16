import {
  ArrayRule,
  ObjectRule,
  RequiredRule,
  StringRule,
  Validator,
} from "@/validator/index.js";
import { describe } from "@jest/globals";
describe("test validation", () => {
  test("simple required name and string, passes", async () => {
    const data = {
      name: "John Doe",
    };

    const result = await Validator.make({
      name: [new RequiredRule(), new StringRule()],
    }).validate(data);

    expect(result.passes()).toBe(true);
  });

  test("validates nested object using dot notation", async () => {
    const data = {
      user: {
        name: "John Doe",
        email: "john@example.com",
      },
    };

    const result = await Validator.make({
      user: [new RequiredRule(), new ObjectRule()],
      "user.name": [new RequiredRule(), new StringRule()],
      "user.email": [new RequiredRule(), new StringRule()],
    }).validate(data);

    expect(result.passes()).toBe(true);
  });

  test("validates array of objects using dot notation", async () => {
    const data = {
      people: [
        { name: "John Doe", age: 30 },
        { name: "Jane Doe", age: 25 },
      ],
    };

    const result = await Validator.make({
      people: [new RequiredRule(), new ArrayRule()],
      "people.*.name": [new RequiredRule(), new StringRule()],
      "people.0": [new RequiredRule(), new ObjectRule()],
      "people.1.name": [new RequiredRule(), new StringRule()],
    }).validate(data);

    expect(result.passes()).toBe(true);
  });

  test("validates specific array index fails when invalid", async () => {
    const data = {
      people: [
        { name: "John Doe", age: 30 },
        { name: 123, age: 25 }, // Invalid: name should be string
      ],
    };

    const result = await Validator.make({
      people: [new RequiredRule(), new ArrayRule()],
      "people.*.name": [new RequiredRule(), new StringRule()],
    }).validate(data);

    expect(result.passes()).toBe(false);
    // expect(result.errors().has('people.1.name')).toBe(true);
  });

  test("validates deep nested objects with arrays", async () => {
    const data = {
      company: {
        name: "Acme Corp",
        departments: [
          {
            name: "Engineering",
            employees: [
              { name: "John", role: "Developer" },
              { name: "Jane", role: "Designer" },
            ],
          },
        ],
      },
    };

    const result = await Validator.make({
      company: [new RequiredRule(), new ObjectRule()],
      "company.name": [new RequiredRule(), new StringRule()],
      "company.departments": [new RequiredRule(), new ArrayRule()],
      "company.departments.*.name": [new RequiredRule(), new StringRule()],
      "company.departments.*.employees": [new RequiredRule(), new ArrayRule()],
      "company.departments.*.employees.*.name": [
        new RequiredRule(),
        new StringRule(),
      ],
      "company.departments.*.employees.*.role": [
        new RequiredRule(),
        new StringRule(),
      ],
    }).validate(data);

    expect(result.passes()).toBe(true);
  });
});
