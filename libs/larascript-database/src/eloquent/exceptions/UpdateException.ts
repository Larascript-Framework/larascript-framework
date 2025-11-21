export default class UpdateException extends Error {
  constructor(message: string = "Update Exception") {
    super(message);
    this.name = "UpdateException";
  }
}
