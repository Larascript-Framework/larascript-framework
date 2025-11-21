export default class DropDatabaseException extends Error {
  constructor(message: string = "Drop Database Exception") {
    super(message);
    this.name = "DropDatabaseException";
  }
}
