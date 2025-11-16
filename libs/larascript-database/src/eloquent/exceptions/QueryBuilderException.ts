export default class QueryBuilderException extends Error {
  constructor(message: string = "Query Builder Exception") {
    super(message);
    this.name = "QueryBuilderException";
  }
}
