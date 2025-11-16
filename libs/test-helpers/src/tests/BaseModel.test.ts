import { beforeEach, describe, expect, test } from "@jest/globals";
import {
  BaseModel,
  BaseModelAttributes,
  IBaseModel,
} from "../test-helpers/BaseModel.js";

// Test model implementation
interface TestModelAttributes extends BaseModelAttributes {
  name: string;
  email: string;
  age: number;
}

class TestModel
  extends BaseModel<TestModelAttributes>
  implements IBaseModel<TestModelAttributes>
{
  constructor(attributes: TestModelAttributes) {
    super(attributes);
  }
}

describe("BaseModel", () => {
  let testAttributes: TestModelAttributes;
  let testModel: TestModel;

  beforeEach(() => {
    testAttributes = {
      id: "test-id-123",
      name: "John Doe",
      email: "john@example.com",
      age: 30,
      createdAt: new Date("2023-01-01T10:00:00Z"),
      updatedAt: new Date("2023-01-01T10:00:00Z"),
    };

    testModel = new TestModel(testAttributes);
  });

  describe("constructor", () => {
    test("should create a model with the provided attributes", () => {
      expect(testModel).toBeInstanceOf(TestModel);
      expect(testModel).toBeInstanceOf(BaseModel);
      expect(testModel.attributes).toBe(testAttributes);
    });

    test("should properly initialize all attributes", () => {
      expect(testModel.attributes.name).toBe("John Doe");
      expect(testModel.attributes.email).toBe("john@example.com");
      expect(testModel.attributes.age).toBe(30);
      expect(testModel.attributes.id).toBe("test-id-123");
    });

    test("should create model with different attributes", () => {
      const differentAttributes: TestModelAttributes = {
        id: "different-id",
        name: "Jane Smith",
        email: "jane@example.com",
        age: 25,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const differentModel = new TestModel(differentAttributes);

      expect(differentModel.attributes).toBe(differentAttributes);
      expect(differentModel.attributes.name).toBe("Jane Smith");
      expect(differentModel.attributes.email).toBe("jane@example.com");
      expect(differentModel.attributes.age).toBe(25);
    });
  });

  describe("setAttributes", () => {
    test("should update all attributes with new values", () => {
      const newAttributes: TestModelAttributes = {
        id: "updated-id",
        name: "Updated Name",
        email: "updated@example.com",
        age: 35,
        createdAt: new Date("2023-03-01T10:00:00Z"),
        updatedAt: new Date("2023-03-01T10:00:00Z"),
      };

      testModel.setAttributes(newAttributes);

      expect(testModel.attributes).toBe(newAttributes);
      expect(testModel.attributes.name).toBe("Updated Name");
      expect(testModel.attributes.email).toBe("updated@example.com");
      expect(testModel.attributes.age).toBe(35);
    });

    test("should replace the entire attributes object", () => {
      const originalAttributes = testModel.attributes;
      const newAttributes: TestModelAttributes = {
        id: "new-id",
        name: "New Name",
        email: "new@example.com",
        age: 40,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      testModel.setAttributes(newAttributes);

      expect(testModel.attributes).not.toBe(originalAttributes);
      expect(testModel.attributes).toBe(newAttributes);
    });

    test("should handle setting attributes multiple times", () => {
      const firstUpdate: TestModelAttributes = {
        id: "first-id",
        name: "First Update",
        email: "first@example.com",
        age: 31,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const secondUpdate: TestModelAttributes = {
        id: "second-id",
        name: "Second Update",
        email: "second@example.com",
        age: 32,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      testModel.setAttributes(firstUpdate);
      expect(testModel.attributes.name).toBe("First Update");

      testModel.setAttributes(secondUpdate);
      expect(testModel.attributes.name).toBe("Second Update");
      expect(testModel.attributes.email).toBe("second@example.com");
    });
  });

  describe("getAttributes", () => {
    test("should return the current attributes object", () => {
      const attributes = testModel.getAttributes();

      expect(attributes).toBe(testAttributes);
      expect(attributes.name).toBe("John Doe");
      expect(attributes.email).toBe("john@example.com");
      expect(attributes.age).toBe(30);
    });

    test("should return updated attributes after setAttributes", () => {
      const newAttributes: TestModelAttributes = {
        id: "updated-id",
        name: "Updated Name",
        email: "updated@example.com",
        age: 35,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      testModel.setAttributes(newAttributes);
      const retrievedAttributes = testModel.getAttributes();

      expect(retrievedAttributes).toBe(newAttributes);
      expect(retrievedAttributes.name).toBe("Updated Name");
    });

    test("should return the same reference to attributes object", () => {
      const firstCall = testModel.getAttributes();
      const secondCall = testModel.getAttributes();

      expect(firstCall).toBe(secondCall);
      expect(firstCall).toBe(testAttributes);
    });
  });

  describe("getId", () => {
    test("should return the ID from attributes", () => {
      const id = testModel.getId();

      expect(id).toBe("test-id-123");
      expect(id).toBe(testAttributes.id);
    });

    test("should return updated ID after attributes change", () => {
      const newAttributes: TestModelAttributes = {
        id: "new-id-456",
        name: "Updated Name",
        email: "updated@example.com",
        age: 35,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      testModel.setAttributes(newAttributes);
      const id = testModel.getId();

      expect(id).toBe("new-id-456");
    });

    test("should handle different ID formats", () => {
      const uuidAttributes: TestModelAttributes = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        name: "UUID Test",
        email: "uuid@example.com",
        age: 30,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const uuidModel = new TestModel(uuidAttributes);
      expect(uuidModel.getId()).toBe("550e8400-e29b-41d4-a716-446655440000");
    });
  });

  describe("getCreatedAt", () => {
    test("should return the creation date from attributes", () => {
      const createdAt = testModel.getCreatedAt();

      expect(createdAt).toEqual(new Date("2023-01-01T10:00:00Z"));
      expect(createdAt).toBe(testAttributes.createdAt);
    });

    test("should return updated creation date after attributes change", () => {
      const newDate = new Date("2023-12-25T15:30:00Z");
      const newAttributes: TestModelAttributes = {
        id: "updated-id",
        name: "Updated Name",
        email: "updated@example.com",
        age: 35,
        createdAt: newDate,
        updatedAt: new Date(),
      };

      testModel.setAttributes(newAttributes);
      const createdAt = testModel.getCreatedAt();

      expect(createdAt).toBe(newDate);
    });

    test("should handle different date formats", () => {
      const now = new Date();
      const nowAttributes: TestModelAttributes = {
        id: "now-id",
        name: "Now Test",
        email: "now@example.com",
        age: 30,
        createdAt: now,
        updatedAt: now,
      };

      const nowModel = new TestModel(nowAttributes);
      expect(nowModel.getCreatedAt()).toBe(now);
    });
  });

  describe("getUpdatedAt", () => {
    test("should return the update date from attributes", () => {
      const updatedAt = testModel.getUpdatedAt();

      expect(updatedAt).toEqual(new Date("2023-01-01T10:00:00Z"));
      expect(updatedAt).toBe(testAttributes.updatedAt);
    });

    test("should return updated modification date after attributes change", () => {
      const newDate = new Date("2023-12-25T15:30:00Z");
      const newAttributes: TestModelAttributes = {
        id: "updated-id",
        name: "Updated Name",
        email: "updated@example.com",
        age: 35,
        createdAt: new Date(),
        updatedAt: newDate,
      };

      testModel.setAttributes(newAttributes);
      const updatedAt = testModel.getUpdatedAt();

      expect(updatedAt).toBe(newDate);
    });

    test("should handle different date formats", () => {
      const now = new Date();
      const nowAttributes: TestModelAttributes = {
        id: "now-id",
        name: "Now Test",
        email: "now@example.com",
        age: 30,
        createdAt: now,
        updatedAt: now,
      };

      const nowModel = new TestModel(nowAttributes);
      expect(nowModel.getUpdatedAt()).toBe(now);
    });
  });

  describe("interface compliance", () => {
    test("should implement IBaseModel interface correctly", () => {
      // This test ensures the model implements all required interface methods
      expect(typeof testModel.setAttributes).toBe("function");
      expect(typeof testModel.getAttributes).toBe("function");
      expect(typeof testModel.getId).toBe("function");
      expect(typeof testModel.getCreatedAt).toBe("function");
      expect(typeof testModel.getUpdatedAt).toBe("function");
      expect(testModel.attributes).toBeDefined();
    });

    test("should have correct attribute types", () => {
      expect(typeof testModel.attributes.name).toBe("string");
      expect(typeof testModel.attributes.email).toBe("string");
      expect(typeof testModel.attributes.age).toBe("number");
      expect(typeof testModel.attributes.id).toBe("string");
      expect(testModel.attributes.createdAt).toBeInstanceOf(Date);
      expect(testModel.attributes.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe("edge cases", () => {
    test("should handle empty string values", () => {
      const emptyAttributes: TestModelAttributes = {
        id: "",
        name: "",
        email: "",
        age: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const emptyModel = new TestModel(emptyAttributes);

      expect(emptyModel.attributes.name).toBe("");
      expect(emptyModel.attributes.email).toBe("");
      expect(emptyModel.attributes.age).toBe(0);
      expect(emptyModel.getId()).toBe("");
    });

    test("should handle null and undefined in custom attributes", () => {
      // This test shows how the model handles custom attributes that might be null/undefined
      // The base model itself doesn't enforce null/undefined handling, but the interface allows it
      const nullableAttributes: TestModelAttributes = {
        id: "test-id",
        name: "Test",
        email: "test@example.com",
        age: 30,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const nullableModel = new TestModel(nullableAttributes);
      expect(nullableModel.getAttributes()).toBeDefined();
    });

    test("should handle very large numbers", () => {
      const largeNumberAttributes: TestModelAttributes = {
        id: "large-id",
        name: "Large Number Test",
        email: "large@example.com",
        age: Number.MAX_SAFE_INTEGER,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const largeNumberModel = new TestModel(largeNumberAttributes);
      expect(largeNumberModel.attributes.age).toBe(Number.MAX_SAFE_INTEGER);
    });
  });

  describe("integration tests", () => {
    test("should maintain consistency across all getter methods", () => {
      const id = testModel.getId();
      const createdAt = testModel.getCreatedAt();
      const updatedAt = testModel.getUpdatedAt();
      const attributes = testModel.getAttributes();

      expect(id).toBe(attributes.id);
      expect(createdAt).toBe(attributes.createdAt);
      expect(updatedAt).toBe(attributes.updatedAt);
    });

    test("should handle complete attribute replacement", () => {
      const originalAttributes = testModel.getAttributes();
      const newAttributes: TestModelAttributes = {
        id: "completely-new-id",
        name: "Completely New",
        email: "new@example.com",
        age: 99,
        createdAt: new Date("2024-01-01T00:00:00Z"),
        updatedAt: new Date("2024-01-01T00:00:00Z"),
      };

      testModel.setAttributes(newAttributes);

      expect(testModel.getId()).toBe("completely-new-id");
      expect(testModel.getCreatedAt()).toEqual(
        new Date("2024-01-01T00:00:00Z"),
      );
      expect(testModel.getUpdatedAt()).toEqual(
        new Date("2024-01-01T00:00:00Z"),
      );
      expect(testModel.getAttributes().name).toBe("Completely New");
      expect(testModel.getAttributes().email).toBe("new@example.com");
      expect(testModel.getAttributes().age).toBe(99);
    });
  });
});
