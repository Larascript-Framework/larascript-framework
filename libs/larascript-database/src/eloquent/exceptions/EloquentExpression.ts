export default class EloquentException extends Error {
  constructor(message: string = "Eloquent Exception") {
    super(message);
    this.name = "EloquentException";
  }
}
