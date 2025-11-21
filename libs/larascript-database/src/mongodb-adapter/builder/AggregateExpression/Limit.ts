class Limit {
  /**
   * Constructs a MongoDB pipeline stage for limiting the number of documents.
   *
   * @param limit - The maximum number of documents to return. If null, no limit is applied.
   * @returns An object representing the $limit stage in a MongoDB aggregation pipeline, or null if no limit is specified.
   */
  static getPipeline(limit: number | null): object | null {
    if (!limit) return null;

    return { $limit: limit };
  }
}

export default Limit;
