export default class ExpressionException extends Error {
  constructor(message: string = "Expression Exception") {
    super(message);
    this.name = "ExpressionException";
  }
}
