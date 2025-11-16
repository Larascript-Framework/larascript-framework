export default class InsertException extends Error {
  constructor(message: string = "Insert Exception") {
    super(message);
    this.name = "InsertException";
  }
}
