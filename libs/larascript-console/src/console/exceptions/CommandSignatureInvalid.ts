export class CommandSignatureInvalid extends Error {
  constructor(message: string = "Invalid Command Signature") {
    super(message);
    this.name = "CommandSignatureInvalid";
  }
}

export default CommandSignatureInvalid;