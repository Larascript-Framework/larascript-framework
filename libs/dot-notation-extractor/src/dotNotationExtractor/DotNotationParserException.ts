export class DotNotationParserException extends Error {
  constructor(message: string = "Dot Notation Parser Exception") {
    super(message);

    this.name = "DotNotationParserException";
  }
}
