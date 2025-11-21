export class CastException extends Error {
  constructor(message: string = "Cast Exception") {
    super(message);
    this.name = "CastException";
  }
}
