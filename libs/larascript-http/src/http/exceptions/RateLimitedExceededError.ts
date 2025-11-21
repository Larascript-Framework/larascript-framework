import { AbstractHttpException } from "../base/AbstractHttpException.js";

export class RateLimitedExceededError extends AbstractHttpException {
    code = 429;
    
    constructor(message: string = "Too many requests. Try again later.") {
      super(message);
      this.name = "RateLimitedExceededError";
    }
  }
  