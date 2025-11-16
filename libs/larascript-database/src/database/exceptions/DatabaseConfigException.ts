export default class DatabaseConfigException extends Error {
  constructor(message: string = "Database Config Exception") {
    super(message);
    this.name = "DatabaseConfigException";
  }
}
