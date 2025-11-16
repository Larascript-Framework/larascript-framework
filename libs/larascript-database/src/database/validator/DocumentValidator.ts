import { returnOrThrow } from "@larascript-framework/larascript-utils";
import { z } from "zod";
import UnidentifiableDocumentException from "../exceptions/UnidentifiableDocumentException.js";
import {
  IDatabaseDocument,
  IDocumentValidator,
} from "../interfaces/index.js";

class DocumentValidator implements IDocumentValidator {
  /**
   * Configure surpression of throwing exceptions for invalid documents
   */
  private throwExceptions = true;

  /**
   * Configure surpression of throwing exceptions for invalid documents
   * @param value
   */
  surpressInvalidDocumentExceptions(value: boolean): void {
    this.throwExceptions = value;
  }

  /**
   * Validates a single document
   * @param document
   * @returns
   */
  validateSingleDocument(document: unknown): boolean {
    const schema = z.object({});

    if (!schema.safeParse(document).success) {
      return returnOrThrow<boolean>({
        shouldThrow: this.throwExceptions,
        throwable: new UnidentifiableDocumentException(
          "Expected a single document, but another type was found",
        ),
        returns: false,
      });
    }

    return true;
  }

  /**
   * Validates multiple documents
   * @param documents
   * @returns
   */
  validateMultipleDocuments(documents: unknown): boolean {
    const schema = z.array(z.object({}));

    if (!schema.safeParse(documents).success) {
      return returnOrThrow<boolean>({
        shouldThrow: this.throwExceptions,
        throwable: new UnidentifiableDocumentException(
          "Expected an array of documents, but another type was found",
        ),
        returns: false,
      });
    }

    return true;
  }

  /**
   * Checks if the document is findable
   * @param document
   * @returns
   */
  validateContainsId(
    documentOrDocuments: IDatabaseDocument | IDatabaseDocument[],
  ): boolean {
    const documents = !Array.isArray(documentOrDocuments)
      ? [documentOrDocuments]
      : documentOrDocuments;

    const schema = z.object({
      id: z.string(),
    });

    for (const i in documents) {
      const document = documents[i];

      if (!schema.safeParse(document).success) {
        const response = returnOrThrow<boolean>({
          shouldThrow: this.throwExceptions,
          throwable: new UnidentifiableDocumentException(
            `An id property was expected but not found at index ${i}`,
          ),
          returns: false,
        });

        if (response === false) {
          return response;
        }
      }
    }

    return true;
  }

  /**
   * Checks if the document are without an id
   * @param document
   * @returns
   */
  validateWithoutId(
    documentOrDocuments: IDatabaseDocument | IDatabaseDocument[],
  ): boolean {
    const documents = !Array.isArray(documentOrDocuments)
      ? [documentOrDocuments]
      : documentOrDocuments;

    for (const i in documents) {
      const document = documents[i];

      if (document.id) {
        const response = returnOrThrow<boolean>({
          shouldThrow: this.throwExceptions,
          throwable: new UnidentifiableDocumentException(
            `An id property was NOT expected but found at index ${i}`,
          ),
          returns: false,
        });

        if (response === false) {
          return response;
        }
      }
    }

    return true;
  }
}

export default DocumentValidator;
