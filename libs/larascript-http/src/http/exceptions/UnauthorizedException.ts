import { AbstractHttpException } from "../base/AbstractHttpException.js";

export class UnauthorizedException extends AbstractHttpException {
    code = 401;

  constructor(message: string = "Unauthorized") {
    super(message);
    this.name = "UnauthorizeError";
  }
}

export default UnauthorizedException;