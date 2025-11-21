import { DotNotationParser } from "@/dotNotationExtractor/DotNotationParser.js";
import { describe, expect, test } from "@jest/globals";

describe("DotNotationParser", () => {
  test("should parse simple key", () => {
    const parser = DotNotationParser.parse("users");

    expect(parser.getFirst()).toBe("users");
    expect(parser.getNext()).toBeUndefined();
    expect(parser.getRest()).toBeUndefined();
    expect(parser.getParts()).toEqual(["users"]);
  });

  test("should parse numeric key", () => {
    const parser = DotNotationParser.parse("0");

    expect(parser.getFirst()).toBe(0);
    expect(parser.getNext()).toBeUndefined();
    expect(parser.getRest()).toBeUndefined();
  });

  test("should parse nested path", () => {
    const parser = DotNotationParser.parse("users.name");

    expect(parser.getFirst()).toBe("users");
    expect(parser.getNext()).toBe("name");
    expect(parser.getRest()).toBe("name");
    expect(parser.getParts()).toEqual(["users", "name"]);
  });

  test("should parse deeply nested path", () => {
    const parser = DotNotationParser.parse("users.0.profile.email");

    expect(parser.getFirst()).toBe("users");
    expect(parser.getNext()).toBe("0");
    expect(parser.getRest()).toBe("0.profile.email");
    expect(parser.getParts()).toEqual(["users", "0", "profile", "email"]);
  });

  test("should handle wildcard notation", () => {
    const parser = DotNotationParser.parse("users.*.name");

    expect(parser.getFirst()).toBe("users");
    expect(parser.getNext()).toBe("*");
    expect(parser.getRest()).toBe("*.name");
    expect(parser.getParts()).toEqual(["users", "*", "name"]);
  });

  test("should forward parser by steps", () => {
    const parser = DotNotationParser.parse("users.profile.email");

    parser.forward(1);
    expect(parser.getFirst()).toBe("profile");
    expect(parser.getRest()).toBe("email");

    parser.forward(1);
    expect(parser.getFirst()).toBe("email");
    expect(parser.getRest()).toBeUndefined();
  });

  test("should get full path", () => {
    const path = "users.0.profile.email";
    const parser = DotNotationParser.parse(path);

    expect(parser.getFullPath()).toBe(path);
  });

  test("should throw error when getting undefined path", () => {
    const parser = new DotNotationParser();

    expect(() => parser.getFullPath()).toThrow("path is not defined");
  });

  test("should throw error when getting undefined first element", () => {
    const parser = new DotNotationParser();

    expect(() => parser.getFirst()).toThrow("first is not defined");
  });

  test("should handle previous index", () => {
    const parser = DotNotationParser.parse("name", "users");

    expect(parser.getPrevious()).toBe("users");
    expect(parser.getFirst()).toBe("name");
  });
});
