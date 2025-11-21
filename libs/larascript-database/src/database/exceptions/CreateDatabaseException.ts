export default class CreateDatabaseException extends Error {
  constructor(message: string = "Create Database Exception") {
    super(message);
    this.name = "CreateDatabaseException";
  }
}
