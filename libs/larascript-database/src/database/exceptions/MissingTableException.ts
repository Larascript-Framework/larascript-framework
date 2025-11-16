export default class MissingTableException extends Error {
  constructor(message: string = "Table name was not specified") {
    super(message);
    this.name = "MissingTable";
  }
}
