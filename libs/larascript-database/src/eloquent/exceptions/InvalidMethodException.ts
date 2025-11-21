export default class InvalidMethodException extends Error {
  constructor(message: string = "Invalid Method Exception") {
    super(message);
    this.name = "InvalidMethodException";
  }
}
