import { DatabaseResourceRepository } from "@/http/resources/repository/DatabaseResourceRepository.js";
import { beforeEach, describe, expect, test } from "@jest/globals";
import { TestHttpEnvironment } from "./helpers/TestHttpEnvironment.js";
import { MockModel } from "./repository/MockModel.js";
import { resetMockModelTable } from "./repository/resetMockModelTable.js";

describe("Database Resource Repository", () => {
  let repository: DatabaseResourceRepository;

  beforeEach(async () => {
    repository = new DatabaseResourceRepository({
      modelConstructor: MockModel,
    });

    await TestHttpEnvironment.create().boot();

    await resetMockModelTable();
  });

  describe("createResource", () => {
    test("should create a resource", async () => {
      const resource = await repository.createResource({
        name: "Test",
        age: 20,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(resource.name).toBe("Test");
      expect(resource.age).toBe(20);
      expect(resource.createdAt).toBeInstanceOf(Date);
      expect(resource.updatedAt).toBeInstanceOf(Date);
    })
  });

  describe("createResourceWithoutSaving", () => {
    test("should create a resource without saving it", async () => {
      const resource = await repository.createResourceWithoutSaving({
        name: "Test",
        age: 20,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(resource.id).toBeUndefined();
      expect(resource.name).toBe("Test");
      expect(resource.age).toBe(20);
    })
  });

  describe("getResource", () => {
    test("should get a resource", async () => {
      const model = await MockModel.create({
        name: "Test",
        age: 20,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await model.save();

      const resource = await repository.getResource(model.id!);

      expect(resource?.name).toBe("Test");
      expect(resource?.age).toBe(20);
      expect(resource?.createdAt).toBeInstanceOf(Date);
      expect(resource?.updatedAt).toBeInstanceOf(Date);
    })
  });

  describe("updateResource", () => {
    test("should update a resource", async () => {
      const model = await MockModel.create({
        name: "Test",
        age: 20,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await model.save();

      const resource = await repository.updateResource({
        id: model.id!,
        name: "Test Updated",
        age: 21,
      });

      await model.refresh();

      expect(resource.name).toBe("Test Updated");
      expect(resource.age).toBe(21);
    })
  });

  describe("deleteResource", () => {
    test("should delete a resource", async () => {
      const model = await MockModel.create({
        name: "Test",
        age: 20,
      });
      await model.save();

      await repository.deleteResource({
        id: model.id!,
        name: "Test",
        age: 20,
      });

      const resource = await repository.getResource(model.id!);

      expect(resource).toBeUndefined();
    });
  });

  describe("getResources", () => {
    test("should get all resources", async () => {
      const model = await MockModel.create({
        name: "Test",
        age: 20,
      });
      await model.save();

      const model2 = await MockModel.create({
        name: "Test 2",
        age: 21,
      });
      await model2.save();

      const resources = await repository.getResources({});

      expect(resources.length).toBe(2);
      expect(resources[0].name).toBe("Test");
      expect(resources[1].name).toBe("Test 2");
    });

    test("should get the resources sorted by the field", async () => {
      const model = await MockModel.create({
        name: "B",
        age: 20,
      });
      const model2 = await MockModel.create({
        name: "A",
        age: 21,
      });
      await model.save();
      await model2.save();

      const resourcesSortedByAgeAscending = await repository.getResources({}, [{ field: "age", sortDirection: "asc" }]);
      expect(resourcesSortedByAgeAscending.length).toBe(2);
      expect(resourcesSortedByAgeAscending[0].age).toBe(20);
      expect(resourcesSortedByAgeAscending[1].age).toBe(21);

      const resourcesSortedByAgeDescending = await repository.getResources({}, [{ field: "age", sortDirection: "desc" }]);
      expect(resourcesSortedByAgeDescending.length).toBe(2);
      expect(resourcesSortedByAgeDescending[0].age).toBe(21);
      expect(resourcesSortedByAgeDescending[1].age).toBe(20);

      const resourcesSortedByNameAscending = await repository.getResources({}, [{ field: "name", sortDirection: "asc" }]);
      expect(resourcesSortedByNameAscending.length).toBe(2);
      expect(resourcesSortedByNameAscending[0].name).toBe("A");
      expect(resourcesSortedByNameAscending[1].name).toBe("B");

      const resourcesSortedByNameDescending = await repository.getResources({}, [{ field: "name", sortDirection: "desc" }]);
      expect(resourcesSortedByNameDescending.length).toBe(2);
      expect(resourcesSortedByNameDescending[0].name).toBe("B");
      expect(resourcesSortedByNameDescending[1].name).toBe("A");
    });

    test("should get the resources with filters", async () => {
      const model = await MockModel.create({
        name: "A",
        age: 20,
      });
      const model2 = await MockModel.create({
        name: "B",
        age: 21,
      });
      await model.save();
      await model2.save();

      const resources = await repository.getResources({ name: "A" });
      expect(resources.length).toBe(1);
      expect(resources[0].name).toBe("A");
      expect(resources[0].age).toBe(20);

      const resources2 = await repository.getResources({ name: "B" });
      expect(resources2.length).toBe(1);
      expect(resources2[0].name).toBe("B");
      expect(resources2[0].age).toBe(21);
    });

    test("should get the resources with eloquent query", async () => {
      const model = await MockModel.create({
        name: "A",
        age: 20,
      });
      const model2 = await MockModel.create({
        name: "B",
        age: 21,
      });
      await model.save();
      await model2.save();

      const resources = await repository.getResources(
        (query) => {
          return query.where("age", ">=", 20);
        }
      );

      expect(resources.length).toBe(2);
      expect(resources[0].name).toBe("A");
      expect(resources[0].age).toBe(20);
      expect(resources[1].name).toBe("B");
      expect(resources[1].age).toBe(21);

      const resources2 = await repository.getResources(
        (query) => {
          return query.where("age", ">=", 20).where("name", "=", "A");
        }
      );

      expect(resources2.length).toBe(1);
      expect(resources2[0].name).toBe("A");
      expect(resources2[0].age).toBe(20);
    });

    test("should get the resources with fuzzy filter", async () => {
      const model = await MockModel.create({
        name: "A B C",
        age: 20,
      });
      const model2 = await MockModel.create({
        name: "D E F",
        age: 21,
      });
      await model.save();
      await model2.save();

      const resources = await repository.getResources({ name: "A%" });
      expect(resources.length).toBe(1);
      expect(resources[0].name).toBe("A B C");
      expect(resources[0].age).toBe(20);

      const resources2 = await repository.getResources({ name: "D%" });
      expect(resources2.length).toBe(1);
      expect(resources2[0].name).toBe("D E F");
      expect(resources2[0].age).toBe(21);
      
    });
  });

  describe("getResourcesCount", () => {
    test("should get the count of resources", async () => {
      const model = await MockModel.create({
        name: "Test",
        age: 20,
      });
      await model.save();

      const count = await repository.getResourcesCount({});

      expect(count).toBe(1);

      const model2 = await MockModel.create({
        name: "Test 2",
        age: 21,
      });
      await model2.save();

      const count2 = await repository.getResourcesCount({});

      expect(count2).toBe(2);
    });

    test("should get the count of resources with eloquent query", async () => {
      const model = await MockModel.create({
        name: "Test",
        age: 20,
      });
      const model2 = await MockModel.create({
        name: "Test 2",
        age: 21,
      });
      await model.save();
      await model2.save();

      const count = await repository.getResourcesCount((query) => {
        return query.where("age", ">=", 20);
      });

      expect(count).toBe(2);

      const count2 = await repository.getResourcesCount((query) => {
        return query.where("age", ">=", 20).where("name", "=", "Test");
      });

      expect(count2).toBe(1);
    });
  });

  describe("getResourcesPage", () => {
    test("should get the page of resources", async () => {
      const model = await MockModel.create({
        name: "Test",
        age: 20,
      });
      await model.save();

      const model2 = await MockModel.create({
        name: "Test 2",
        age: 21,
      });
      await model2.save();

      const resources = await repository.getResourcesPage({}, 1, 10);

      expect(resources.length).toBe(2);
      expect(resources[0].name).toBe("Test");
      expect(resources[1].name).toBe("Test 2");
    });

    test("should skip the resources when on page 2", async () => {
      const model = await MockModel.create({
        name: "Test",
        age: 20,
      });
      await model.save();

      const model2 = await MockModel.create({
        name: "Test 2",
        age: 21,
      });
      await model2.save();

      const resources = await repository.getResourcesPage({}, 2, 1);

      expect(resources.length).toBe(1);
      expect(resources[0].name).toBe("Test 2");
    });

    test("should get the paginated resources sorted by the field", async () => {
      const model = await MockModel.create({
        name: "B",
        age: 20,
      });
      const model2 = await MockModel.create({
        name: "A",
        age: 21,
      });
      await model.save();
      await model2.save();

      const resourcesSortedByAgeAscending = await repository.getResourcesPage({}, 1, 10, [{ field: "age", sortDirection: "asc" }]);
      expect(resourcesSortedByAgeAscending.length).toBe(2);
      expect(resourcesSortedByAgeAscending[0].age).toBe(20);
      expect(resourcesSortedByAgeAscending[1].age).toBe(21);

      const resourcesSortedByAgeDescending = await repository.getResourcesPage({}, 1, 10, [{ field: "age", sortDirection: "desc" }]);
      expect(resourcesSortedByAgeDescending.length).toBe(2);
      expect(resourcesSortedByAgeDescending[0].age).toBe(21);
      expect(resourcesSortedByAgeDescending[1].age).toBe(20);

      const resourcesSortedByNameAscending = await repository.getResourcesPage({}, 1, 10, [{ field: "name", sortDirection: "asc" }]);
      expect(resourcesSortedByNameAscending.length).toBe(2);
      expect(resourcesSortedByNameAscending[0].name).toBe("A");
      expect(resourcesSortedByNameAscending[1].name).toBe("B");

      const resourcesSortedByNameDescending = await repository.getResourcesPage({}, 1, 10, [{ field: "name", sortDirection: "desc" }]);
      expect(resourcesSortedByNameDescending.length).toBe(2);
      expect(resourcesSortedByNameDescending[0].name).toBe("B");
      expect(resourcesSortedByNameDescending[1].name).toBe("A");
    });

    test("should get the paginated resources with eloquent query", async () => {
      const model = await MockModel.create({
        name: "Test",
        age: 20,
      });
      const model2 = await MockModel.create({
        name: "Test 2",
        age: 21,
      });
      await model.save();
      await model2.save();

      const resources = await repository.getResourcesPage((query) => {
        return query.where("age", ">=", 20);
      }, 1, 10);

      expect(resources.length).toBe(2);
      expect(resources[0].name).toBe("Test");
      expect(resources[1].name).toBe("Test 2");

      const resources2 = await repository.getResourcesPage((query) => {
        return query.where("age", ">=", 20).where("name", "=", "Test");
      }, 1, 10);

      expect(resources2.length).toBe(1);
      expect(resources2[0].name).toBe("Test");
      expect(resources2[0].age).toBe(20);
    });
  });

  describe("stripSensitiveData", () => {
    test("should strip the sensitive data", async () => {
      const resource = await repository.stripSensitiveData({
        name: "Test",
        age: 20,
        secret: "Secret",
      });

      const strippedResource = await repository.stripSensitiveData(resource);

      expect(strippedResource.secret).toBeUndefined();
      expect(strippedResource.name).toBe("Test");
      expect(strippedResource.age).toBe(20);
    })
  });
});
