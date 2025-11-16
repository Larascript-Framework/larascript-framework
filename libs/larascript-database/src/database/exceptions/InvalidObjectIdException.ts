export default class InvalidObjectIdException extends Error {
  constructor(message: string = "Invalid ObjectId") {
    super(message);
    this.name = "InvalidObjectId";
  }
}
