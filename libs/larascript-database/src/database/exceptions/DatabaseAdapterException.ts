export default class DatabaseAdapterException extends Error {
  constructor(message: string = "Database Adapter Exception") {
    super(message);
    this.name = "DatabaseAdapterException";
  }
}
