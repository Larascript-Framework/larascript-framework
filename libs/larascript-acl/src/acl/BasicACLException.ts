export class BasicACLException extends Error {
  constructor(message: string = "Basic ACL Exception") {
    super();
    this.message = message;
  }
}

export default BasicACLException;
