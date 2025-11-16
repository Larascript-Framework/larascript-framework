import { beforeEach, describe, expect, test } from "@jest/globals";
import UnidentifiableDocumentException from "../../database/exceptions/UnidentifiableDocumentException.js";
import DocumentValidator from "../../database/validator/DocumentValidator.js";

describe("Document Validator", () => {
  let validator: DocumentValidator;

  beforeEach(() => {
    validator = new DocumentValidator();
  });

  describe("validateSingleDocument", () => {
    test("should not throw an error if document is valid", () => {
      const document = { id: 1, name: "Test" };

      expect(() => validator.validateSingleDocument(document)).not.toThrow(
        UnidentifiableDocumentException,
      );
    });

    test("should throw an error if document is invalid", () => {
      const document = [
        { id: 1, name: "Test" },
        { id: 2, name: "Test2" },
      ];

      expect(() => validator.validateSingleDocument(document)).toThrow(
        UnidentifiableDocumentException,
      );
    });
  });

  describe("validateMultipleDocuments", () => {
    test("should not throw an error if documents are valid", () => {
      const documents = [
        { id: 1, name: "Test" },
        { id: 2, name: "Test2" },
      ];

      expect(() => validator.validateMultipleDocuments(documents)).toBeTruthy();
    });

    test("should throw an error if documents are invalid", () => {
      const document = { id: 1, name: "Test" };

      expect(() => validator.validateMultipleDocuments(document)).toThrow(
        UnidentifiableDocumentException,
      );
    });
  });

  describe("validateContainsId", () => {
    test("should not throw an error if document contains id", () => {
      const document = { id: 1, name: "Test" };

      expect(() => validator.validateContainsId(document)).toBeTruthy();
    });

    test("should handle array of documents and not throw an error if document contains id", () => {
      const document = [
        { id: 1, name: "Test" },
        { id: 2, name: "Test2" },
      ];

      expect(() => validator.validateContainsId(document)).toBeTruthy();
    });

    test("should throw an error if document does not contain id", () => {
      const document = { name: "Test" };

      expect(() => validator.validateContainsId(document)).toThrow(
        UnidentifiableDocumentException,
      );
    });
  });

  describe("validateWithoutId", () => {
    test("should not throw an error if document does not contain id", () => {
      const document = { name: "Test" };

      expect(() => validator.validateWithoutId(document)).not.toThrow(
        UnidentifiableDocumentException,
      );
    });

    test("should throw an error if document contains id", () => {
      const document = { id: 1, name: "Test" };

      expect(() => validator.validateWithoutId(document)).toThrow(
        UnidentifiableDocumentException,
      );
    });
  });
});
