export class ValidatorException extends Error {
  constructor(message: string = "Validation failed") {
    super(message);
  }
}

export default ValidatorException;
