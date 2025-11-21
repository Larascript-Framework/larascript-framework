export default class UnidentifiableDocumentException extends Error {
  constructor(message: string = "An id property was expected but not found") {
    super(message);
    this.name = "UnidentifiableDocument";
  }
}
