import { collect } from "@/collections/collect.js";
import { describe, expect, test } from "@jest/globals";
import { Collection as CollectJsCollection } from "collect.js";

describe("collection test", () => {
  test("instance", () => {
    const result = collect();

    expect(result).toBeTruthy();
    expect(typeof result.add === "function");
    expect(typeof result.find === "function");
  });

  test("get data", () => {
    const collection = collect([1, 2, 3]);

    expect(collection[0]).toBe(1);
    expect(collection[1]).toBe(2);
    expect(collection[2]).toBe(3);
  });

  test("set data", () => {
    const collection = collect<number>([]);

    collection[0] = 1;
    collection[1] = 2;
    collection[2] = 3;

    expect(collection.count()).toBe(3);
    expect(collection[0]).toBe(1);
    expect(collection[1]).toBe(2);
    expect(collection[2]).toBe(3);
  });

  test("collection iterable", () => {
    const collection = collect([1, 2, 3]);

    for (let i = 0; i < collection.count(); i++) {
      expect(collection[i]).toBe(
        {
          0: 1,
          1: 2,
          2: 3,
        }[i],
      );
    }
  });

  test("forEach method", () => {
    const collection = collect([1, 2, 3]);
    const result: number[] = [];

    collection.forEach((item) => {
      result.push(item * 2);
    });

    expect(result).toEqual([2, 4, 6]);
  });

  test("map method", () => {
    const collection = collect([1, 2, 3]);
    const result = collection.map((item) => item * 2).all();

    expect(result).toEqual([2, 4, 6]);
  });

  test("all and toArray methods", () => {
    const items = [1, 2, 3];
    const collection = collect(items);

    expect(collection.all()).toEqual(items);
    expect(collection.toArray()).toEqual(items);
  });

  test("get and set methods", () => {
    const collection = collect([1, 2, 3]);

    expect(collection.get(1)).toBe(2);

    collection.set(1, 5);
    expect(collection.get(1)).toBe(5);
  });

  test("add and remove methods", () => {
    const collection = collect([1, 2, 3]);

    collection.add(4);
    expect(collection.count()).toBe(4);
    expect(collection.last()).toBe(4);

    collection.remove(1);
    expect(collection.count()).toBe(3);
    expect(collection.get(1)).toBe(3);
  });

  test("first and last methods", () => {
    const collection = collect([1, 2, 3]);

    expect(collection.first()).toBe(1);
    expect(collection.last()).toBe(3);

    const emptyCollection = collect([]);
    expect(emptyCollection.first()).toBeNull();
    expect(emptyCollection.last()).toBeNull();
  });

  test("count method", () => {
    const collection = collect([1, 2, 3]);
    expect(collection.count()).toBe(3);

    collection.add(4);
    expect(collection.count()).toBe(4);

    collection.remove(0);
    expect(collection.count()).toBe(3);
  });

  test("sum method", () => {
    const items = [{ value: 10 }, { value: 20 }, { value: 30 }];
    const collection = collect(items);

    expect(collection.sum("value")).toBe(60);
  });

  test("average method", () => {
    const items = [{ score: 90 }, { score: 80 }, { score: 70 }];
    const collection = collect(items);

    expect(collection.average("score")).toBe(80);
  });

  test("max and min methods", () => {
    const items = [{ price: 100 }, { price: 200 }, { price: 150 }];
    const collection = collect(items);

    expect(collection.max("price")).toBe(200);
    expect(collection.min("price")).toBe(100);
  });

  test("where methods", () => {
    const items = [
      { price: 100 },
      { price: 200 },
      { price: 300 },
      { price: 400 },
      { price: 500 },
    ];
    const filtered = collect(items)
      .where("price", ">", 100)
      .where("price", "<", 500)
      .all();

    expect(filtered).toEqual([{ price: 200 }, { price: 300 }, { price: 400 }]);
  });

  test("toCollectJs", () => {
    const collectjs = collect().toCollectJs();
    expect(collectjs instanceof CollectJsCollection).toBeTruthy();
  });
});
