export default class DatabaseConnectionException extends Error {
  constructor(message: string = "Invalid Database Connection") {
    super(message);
    this.name = "InvalidDatabaseConnection";
  }
}
