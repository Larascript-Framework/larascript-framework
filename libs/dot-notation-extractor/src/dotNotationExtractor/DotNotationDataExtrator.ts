import { DotNotationParser } from "./DotNotationParser.js";

type TStateName = "REDUCABLE" | "SKIP";

type TState = {
  type: TStateName | null;
  dotPath: DotNotationParser;
  acc: unknown;
  attributes: unknown;
};

const states: Record<TStateName, TStateName> = {
  REDUCABLE: "REDUCABLE",
  SKIP: "SKIP",
};

type TDotNotationDataExtratorOptions = {
  paths: string[];
  data: unknown;
};

type TDotNotationDataExtratorResult = Record<string, unknown>;

export class DotNotationDataExtrator {
  /**
   * Static factory method to create and initialize a DataExtractor instance
   *
   * @param data - The source data object to extract values from
   * @param path - Object containing dot notation paths as keys
   * @returns Extracted values mapped to their corresponding paths
   */
  public static reduceOne(
    data: TDotNotationDataExtratorOptions["data"],
    path: string,
  ): TDotNotationDataExtratorResult {
    const result = new DotNotationDataExtrator().init({
      data,
      paths: [path],
    });

    return {
      [path]: result[path],
    };
  }

  /**
   * Static factory method to create and initialize a DataExtractor instance
   *
   * @param data - The source data object to extract values from
   * @param paths - Object containing dot notation paths as keys
   * @returns Extracted values mapped to their corresponding paths
   */
  public static reduceMany(
    data: TDotNotationDataExtratorOptions["data"],
    paths: TDotNotationDataExtratorOptions["paths"],
  ): TDotNotationDataExtratorResult {
    return new DotNotationDataExtrator().init({
      data,
      paths,
    });
  }

  /**
   * Initializes data extraction by processing multiple dot notation paths against a data object
   *
   * @param options - Configuration options for data extraction
   * @param options.data - The source data object to extract values from
   * @param options.paths - Object containing dot notation paths as keys
   * @returns An object containing the extracted values mapped to their paths
   */
  public init(
    options: TDotNotationDataExtratorOptions,
  ): TDotNotationDataExtratorResult {
    const { paths, data } = options;

    return paths.reduce((acc, path) => {
      acc[path] = this.reducer(path, acc, data);
      return acc;
    }, {});
  }

  /**
   * Core recursive function that processes each path segment and extracts values
   */
  reducer(path: string, acc: unknown, attributes: unknown, recursionLevel = 1) {
    const state = this.getState(path, acc, attributes);

    // 1. Reduce to specific target
    if (state.type === states.REDUCABLE) {
      return this.reduceAttributes(state, recursionLevel);
    }

    // 2. Skip current, forward to next segment
    if (state.type === states.SKIP) {
      return this.reducer(
        state.dotPath.getRest() as string,
        state.acc,
        state.attributes,
        recursionLevel + 1,
      );
    }

    return acc;
  }

  /**
   * Processes attribute values based on the current state and path
   */
  reduceAttributes(state: TState, recursionLevel = 1) {
    const target = state.dotPath.getFirst();
    const nextTarget = state.dotPath.getNext();
    const attributes = state.attributes;
    const rest = state.dotPath.getRest();
    const nextRecursionLevel = recursionLevel + 1;

    const isObject = typeof attributes === "object";
    const hasTargetProperty = attributes?.[target];
    const hasDefinedNextTarget =
      typeof nextTarget !== "undefined" && nextTarget !== "*";
    const hasNoRemainingPath = typeof rest === "undefined";

    // Case 1: Navigate deeper into nested object
    const shouldNavigateDeeper =
      isObject && hasTargetProperty && hasDefinedNextTarget;
    if (shouldNavigateDeeper) {
      return this.reducer(
        rest as string,
        state.acc,
        attributes[target],
        nextRecursionLevel,
      );
    }

    // Case 2: Return final value when reaching end of path
    const shouldReturnFinalValue =
      isObject &&
      typeof attributes?.[target] !== "undefined" &&
      hasNoRemainingPath;
    if (shouldReturnFinalValue) {
      return attributes[target];
    }

    // Case 3: Continue traversing object path
    const shouldContinueTraversal =
      isObject && hasTargetProperty && typeof rest !== "undefined";
    if (shouldContinueTraversal) {
      return this.reducer(
        rest as string,
        state.acc,
        attributes[target],
        nextRecursionLevel,
      );
    }

    // Case 4: Handle array processing
    if (Array.isArray(attributes)) {
      return this.reduceArray(
        this.updateState(state, {
          attributes: attributes as unknown[],
          acc: [],
        }),
        recursionLevel,
      );
    }

    return undefined;
  }

  /**
   * Processes array values by applying the extraction logic to each element
   */
  reduceArray(state: TState, recursionLevel = 1) {
    const acc: unknown[] = [];
    const target = state.dotPath.getFirst();
    const attributes = state.attributes;

    const attributesIsArray = Array.isArray(attributes);
    const attributesIsObject =
      typeof attributes === "object" && !attributesIsArray;

    // Handle direct property access on object
    const shouldAccessObjectProperty =
      attributesIsObject && attributes?.[target];
    if (shouldAccessObjectProperty) {
      return attributes[target];
    }

    // Return early if not processing an array
    if (!attributesIsArray) {
      return attributes;
    }

    // Process each array element recursively
    (attributes as unknown[]).forEach((attr) => {
      const result = this.reduceAttributes(
        this.updateState(state, {
          attributes: attr,
          acc,
        }),
        recursionLevel + 1,
      );

      // Flatten array results or add single values
      if (Array.isArray(result)) {
        acc.push(...result);
      } else {
        acc.push(result);
      }
    });

    return acc;
  }

  /**
   * Updates the current state with new values
   */
  protected updateState(state: TState, update: Partial<TState>): TState {
    return {
      ...state,
      ...update,
    };
  }

  /**
   * Determines the current state based on path and attributes
   */
  protected getState(path: string, acc: unknown, attributes: unknown) {
    const dotPath = DotNotationParser.parse(path);
    const targetIndex = dotPath.getFirst();

    // Check target properties
    const isTargetWildcard = targetIndex === "*";

    const state: TState = {
      type: states.REDUCABLE,
      dotPath,
      acc,
      attributes,
    };

    // Determine state type based on conditions
    if (isTargetWildcard) {
      state.type = states.SKIP;
      return state;
    }

    return state;
  }
}
