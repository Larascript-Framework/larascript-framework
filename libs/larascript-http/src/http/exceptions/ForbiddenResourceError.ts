import { AbstractHttpException } from "../base/AbstractHttpException.js";

export class ForbiddenResourceError extends AbstractHttpException {
    code = 403;

    constructor(
      message: string = "You do not have permission to access this resource",
    ) {
      super(message);
      this.name = "ForbiddenResourceError";
    }
  }
  