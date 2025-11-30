import Middleware from "./Middleware.js";

export abstract class AbstractAuthMiddleware<Config = unknown> extends Middleware<Config> {

    constructor() {
        super();
    }

}
