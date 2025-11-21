import { BaseModel, BaseModelAttributes } from "@/test-helpers/BaseModel.js";
import { beforeEach, describe, expect, test } from "@jest/globals";
import { BaseInMemoryRepository } from "../test-helpers/BaseInMemoryRepository.js";

// Test model implementation
interface TestModelAttributes extends BaseModelAttributes {
  name: string;
  email: string;
  age: number;
}

class TestModel extends BaseModel<TestModelAttributes> {}

// Test repository implementation
class TestRepository extends BaseInMemoryRepository<TestModel> {
  constructor() {
    super(TestModel);
  }
}

describe("BaseInMemoryRepository", () => {
  let repository: TestRepository;
  let testModel1: TestModel;
  let testModel2: TestModel;
  let testModel3: TestModel;

  beforeEach(() => {
    repository = new TestRepository();

    testModel1 = new TestModel({
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      age: 30,
      createdAt: new Date("2023-01-01"),
      updatedAt: new Date("2023-01-01"),
    });

    testModel2 = new TestModel({
      id: "2",
      name: "Jane Smith",
      email: "jane@example.com",
      age: 25,
      createdAt: new Date("2023-01-02"),
      updatedAt: new Date("2023-01-02"),
    });

    testModel3 = new TestModel({
      id: "3",
      name: "Bob Johnson",
      email: "bob@example.com",
      age: 35,
      createdAt: new Date("2023-01-03"),
      updatedAt: new Date("2023-01-03"),
    });
  });

  describe("findOne", () => {
    test("should find a record by id", async () => {
      repository.setRecords([testModel1, testModel2, testModel3]);
      const result = await repository.findOne("id", "1");

      expect(result?.getId()).toBe(testModel1.getId());
    });

    test("should return null if record is not found", async () => {
      repository.setRecords([testModel1, testModel2, testModel3]);
      const result = await repository.findOne("id", "4");

      expect(result).toBeNull();
    });

    test("should find a record by name", async () => {
      repository.setRecords([testModel1, testModel2, testModel3]);
      const result = await repository.findOne("name", "John Doe");

      expect(result?.getId()).toBe(testModel1.getId());
    });

    test("should find a record by email", async () => {
      repository.setRecords([testModel1, testModel2, testModel3]);
      const result = await repository.findOne("email", "john@example.com");

      expect(result?.getId()).toBe(testModel1.getId());
    });
  });

  describe("findById", () => {
    test("should find a record by id", async () => {
      repository.setRecords([testModel1, testModel2, testModel3]);
      const result = await repository.findById("1");

      expect(result?.getId()).toBe(testModel1.getId());
    });

    test("should return null if record is not found", async () => {
      repository.setRecords([testModel1, testModel2, testModel3]);
      const result = await repository.findById("4");

      expect(result).toBeNull();
    });
  });

  describe("findMany", () => {
    test("should find multiple records by name", async () => {
      repository.setRecords([testModel1, testModel2, testModel3]);
      const result = await repository.findMany("name", "John Doe");

      expect(result).toHaveLength(1);
    });

    test("should return empty array if no records are found", async () => {
      repository.setRecords([testModel1, testModel2, testModel3]);
      const result = await repository.findMany("name", "NonExistent");

      expect(result).toHaveLength(0);
    });

    test("should return multiple records when where condition matches multiple records", async () => {
      const testModel4 = new TestModel({
        id: "4",
        name: "John Doe",
        email: "john2@example.com",
        age: 30,
        createdAt: new Date("2023-01-01"),
        updatedAt: new Date("2023-01-01"),
      });

      repository.setRecords([testModel1, testModel2, testModel3, testModel4]);
      const result = await repository.findMany("name", "John Doe");

      expect(result).toHaveLength(2);
    });
  });

  describe("create", () => {
    test("should create a new model instance and add it to records", async () => {
      const attributes: TestModelAttributes = {
        id: "4",
        name: "New User",
        email: "new@example.com",
        age: 28,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await repository.create(attributes);

      expect(result).toBeInstanceOf(TestModel);
      expect(result.getAttributes()).toEqual(attributes);
      expect(await repository.getRecords()).toHaveLength(1);
      expect((await repository.getRecords())[0]).toBe(result);
    });

    test("should create multiple records and maintain them in order", async () => {
      const attributes1: TestModelAttributes = {
        id: "1",
        name: "User 1",
        email: "user1@example.com",
        age: 25,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const attributes2: TestModelAttributes = {
        id: "2",
        name: "User 2",
        email: "user2@example.com",
        age: 30,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result1 = await repository.create(attributes1);
      const result2 = await repository.create(attributes2);

      expect(await repository.getRecords()).toHaveLength(2);
      expect((await repository.getRecords())[0]).toBe(result1);
      expect((await repository.getRecords())[1]).toBe(result2);
    });
  });

  describe("update", () => {
    beforeEach(() => {
      repository.setRecords([testModel1, testModel2, testModel3]);
    });

    test("should update model attributes when where condition matches", async () => {
      repository.update("name", "John Doe", {
        age: 31,
        email: "john.updated@example.com",
      });

      const updatedRecord = (await repository.getRecords()).find(
        (r) => r.getAttributes().name === "John Doe",
      );
      expect(updatedRecord).toBeDefined();
      expect(updatedRecord!.getAttributes().age).toBe(31);
      expect(updatedRecord!.getAttributes().email).toBe(
        "john.updated@example.com",
      );
      expect(updatedRecord!.getAttributes().name).toBe("John Doe"); // Should remain unchanged
    });

    test("should update multiple records when where condition matches multiple records", async () => {
      // Add another record with same name
      const testModel4 = new TestModel({
        id: "4",
        name: "John Doe",
        email: "john2@example.com",
        age: 40,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      repository.setRecords([testModel1, testModel2, testModel3, testModel4]);

      repository.update("name", "John Doe", { age: 32 });

      const johnRecords = (await repository.getRecords()).filter(
        (r) => r.getAttributes().name === "John Doe",
      );
      expect(johnRecords).toHaveLength(2);
      johnRecords.forEach((record) => {
        expect(record.getAttributes().age).toBe(32);
      });
    });

    test("should not update any records when where condition does not match", async () => {
      const originalRecords = (await repository.getRecords()).map((r) => ({
        ...r.getAttributes(),
      }));

      repository.update("name", "NonExistent", { age: 999 });

      const currentRecords = await repository.getRecords();
      expect(currentRecords).toHaveLength(3);
      currentRecords.forEach((record, index) => {
        expect(record.getAttributes()).toEqual(originalRecords[index]);
      });
    });

    test("should update records when using email as where condition", async () => {
      repository.update("email", "jane@example.com", { name: "Jane Updated" });

      const updatedRecord = (await repository.getRecords()).find(
        (r) => r.getAttributes().email === "jane@example.com",
      );
      expect(updatedRecord).toBeDefined();
      expect(updatedRecord!.getAttributes().name).toBe("Jane Updated");
    });

    test("should update records when using age as where condition", async () => {
      repository.update("age", 35, { name: "Bob Updated" });

      const updatedRecord = (await repository.getRecords()).find(
        (r) => r.getAttributes().age === 35,
      );
      expect(updatedRecord).toBeDefined();
      expect(updatedRecord!.getAttributes().name).toBe("Bob Updated");
    });
  });

  describe("delete", () => {
    beforeEach(() => {
      repository.setRecords([testModel1, testModel2, testModel3]);
    });

    test("should delete record when where condition matches", async () => {
      repository.delete("name", "John Doe");

      const records = await repository.getRecords();
      expect(records).toHaveLength(2);
      expect(
        records.find((r) => r.getAttributes().name === "John Doe"),
      ).toBeUndefined();
      expect(
        records.find((r) => r.getAttributes().name === "Jane Smith"),
      ).toBeDefined();
      expect(
        records.find((r) => r.getAttributes().name === "Bob Johnson"),
      ).toBeDefined();
    });

    test("should delete multiple records when where condition matches multiple records", async () => {
      // Add another record with same name
      const testModel4 = new TestModel({
        id: "4",
        name: "John Doe",
        email: "john2@example.com",
        age: 40,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      repository.setRecords([testModel1, testModel2, testModel3, testModel4]);

      repository.delete("name", "John Doe");

      const records = await repository.getRecords();
      expect(records).toHaveLength(2);
      expect(
        records.find((r) => r.getAttributes().name === "John Doe"),
      ).toBeUndefined();
    });

    test("should not delete any records when where condition does not match", async () => {
      repository.delete("name", "NonExistent");

      const records = await repository.getRecords();
      expect(records).toHaveLength(3);
      expect(
        records.find((r) => r.getAttributes().name === "John Doe"),
      ).toBeDefined();
      expect(
        records.find((r) => r.getAttributes().name === "Jane Smith"),
      ).toBeDefined();
      expect(
        records.find((r) => r.getAttributes().name === "Bob Johnson"),
      ).toBeDefined();
    });

    test("should delete records when using email as where condition", async () => {
      repository.delete("email", "jane@example.com");

      const records = await repository.getRecords();
      expect(records).toHaveLength(2);
      expect(
        records.find((r) => r.getAttributes().email === "jane@example.com"),
      ).toBeUndefined();
    });

    test("should delete records when using age as where condition", async () => {
      repository.delete("age", 35);

      const records = await repository.getRecords();
      expect(records).toHaveLength(2);
      expect(records.find((r) => r.getAttributes().age === 35)).toBeUndefined();
    });
  });

  describe("setRecords", () => {
    test("should set records to the provided array", async () => {
      const records = [testModel1, testModel2];
      repository.setRecords(records);

      expect(await repository.getRecords()).toBe(records);
      expect(await repository.getRecords()).toHaveLength(2);
    });

    test("should replace existing records when called multiple times", async () => {
      repository.setRecords([testModel1]);
      expect(await repository.getRecords()).toHaveLength(1);

      repository.setRecords([testModel2, testModel3]);
      expect(await repository.getRecords()).toHaveLength(2);
      expect((await repository.getRecords())[0]).toBe(testModel2);
      expect((await repository.getRecords())[1]).toBe(testModel3);
    });

    test("should set empty array when provided empty array", async () => {
      repository.setRecords([]);
      expect(await repository.getRecords()).toHaveLength(0);
    });
  });

  describe("getRecords", () => {
    test("should return empty array when no records are set", async () => {
      expect(await repository.getRecords()).toEqual([]);
    });

    test("should return all records that have been set", async () => {
      const records = [testModel1, testModel2, testModel3];
      repository.setRecords(records);

      expect(await repository.getRecords()).toBe(records);
      expect(await repository.getRecords()).toHaveLength(3);
    });

    test("should return records after creating new ones", async () => {
      const attributes: TestModelAttributes = {
        id: "4",
        name: "New User",
        email: "new@example.com",
        age: 28,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      repository.create(attributes);
      expect(await repository.getRecords()).toHaveLength(1);
    });
  });

  describe("clearRecords", () => {
    test("should clear all records", async () => {
      repository.setRecords([testModel1, testModel2, testModel3]);
      expect(await repository.getRecords()).toHaveLength(3);

      repository.clearRecords();
      expect(await repository.getRecords()).toHaveLength(0);
    });

    test("should clear records even when already empty", async () => {
      expect(await repository.getRecords()).toHaveLength(0);

      repository.clearRecords();
      expect(await repository.getRecords()).toHaveLength(0);
    });

    test("should clear records after creating new ones", async () => {
      const attributes: TestModelAttributes = {
        id: "4",
        name: "New User",
        email: "new@example.com",
        age: 28,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      repository.create(attributes);
      expect(await repository.getRecords()).toHaveLength(1);

      repository.clearRecords();
      expect(await repository.getRecords()).toHaveLength(0);
    });
  });

  describe("integration tests", () => {
    test("should handle full CRUD operations correctly", async () => {
      // Create
      const attributes: TestModelAttributes = {
        id: "1",
        name: "Integration Test",
        email: "integration@example.com",
        age: 25,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const created = repository.create(attributes);
      expect(await repository.getRecords()).toHaveLength(1);

      // Update
      repository.update("name", "Integration Test", { age: 26 });
      expect((await repository.getRecords())[0].getAttributes().age).toBe(26);

      // Delete
      repository.delete("name", "Integration Test");
      expect(await repository.getRecords()).toHaveLength(0);
    });

    test("should maintain data integrity across operations", async () => {
      repository.setRecords([testModel1, testModel2]);

      // Update one record
      repository.update("name", "John Doe", { age: 31 });

      // Verify only the target record was updated
      const johnRecord = (await repository.getRecords()).find(
        (r) => r.getAttributes().name === "John Doe",
      );
      const janeRecord = (await repository.getRecords()).find(
        (r) => r.getAttributes().name === "Jane Smith",
      );

      expect(johnRecord!.getAttributes().age).toBe(31);
      expect(janeRecord!.getAttributes().age).toBe(25); // Should remain unchanged
    });
  });
});
