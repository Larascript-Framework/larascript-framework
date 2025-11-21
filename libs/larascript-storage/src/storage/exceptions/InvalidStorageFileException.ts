export class InvalidStorageFileException extends Error {
  constructor(message = "Invalid Storage File") {
    super(message);
    this.name = "InvalidStorageFileException";
  }
}
