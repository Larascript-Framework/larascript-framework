import { z } from "zod";

class PostgresJsonNormalizer {
  /**
   * The property name to use for the array values
   */
  protected arrayProperty = "ArrayValues";

  /**
   * Normalizes the document by parsing the JSON properties
   *
   * If a value is an array, wrap it in a values property. e.g, { values: [...] }
   * This is to prevent the error "invalid input syntax for type json",  "malformed array literal"
   *
   * @param document
   * @param jsonProperties
   */
  public documentsAsUnsafePostgresArray(
    document: object,
    jsonProperties: string[],
  ) {
    jsonProperties.forEach((property) => {
      if (document[property]) {
        document[property] = this.valueToUnsafe(document[property]);
      }
    });

    return document;
  }

  /**
   * Denormalizes the document by parsing the JSON properties
   *
   * @param document
   * @param jsonProperties
   */
  public documentsAsSafePostgresArray(
    document: object,
    jsonProperties: string[],
  ) {
    jsonProperties.forEach((property) => {
      if (document[property]) {
        const value = this.valueToSafe(document[property]) as object;

        // Check value is an object, and only contains this[arrayProperty]
        const onlyContainsValues =
          Object.keys(value).length === 1 &&
          Object.keys(value)[0] === this.arrayProperty &&
          Array.isArray(value[this.arrayProperty]);

        if (onlyContainsValues) {
          document[property] = value[this.arrayProperty];
        } else {
          document[property] = value;
        }
      }
    });

    return document;
  }

  /**
   * Normalizes the value of a JSON property
   *
   * If a value is an array, wrap it in a values property. e.g, { values: [...] }
   * This is to prevent the error "invalid input syntax for type json",  "malformed array literal"
   *
   * @param value
   */
  protected valueToSafe(value: unknown) {
    // Check if it's an array
    if (Array.isArray(value)) {
      value = { [this.arrayProperty]: value };
    }

    // Check if it's an object
    if (typeof value === "object" && value !== null) {
      return JSON.stringify(value);
    }

    return value;
  }

  /**
   * Denormalizes the value of a JSON property
   *
   * @param value
   */
  protected valueToUnsafe(value: unknown) {
    if (!this.validateValueObjectOrArray(value)) {
      return value;
    }

    const valueObject = value as object;

    if (typeof valueObject === "object" && valueObject?.[this.arrayProperty]) {
      return valueObject[this.arrayProperty];
    }

    return valueObject;
  }

  /**
   * Validates if the value is an array or object
   *
   * @param value
   */
  protected validateValueObjectOrArray(value: unknown) {
    const schema = z.array(z.any()).or(z.record(z.any()));
    return schema.safeParse(value).success;
  }
}

export default PostgresJsonNormalizer;
