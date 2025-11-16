class Skip {
  /**
   * Converts the offset property from the query builder into its MongoDB pipeline representation.
   *
   * Example: { $skip: 10 }
   *
   * @param {number} offset - The offset property from the query builder.
   * @returns {object} The MongoDB pipeline representation of the offset property, or null if no offset is specified.
   */
  static getPipeline(offset: number | null): object | null {
    if (!offset) return null;
    return { $skip: offset };
  }
}

export default Skip;
