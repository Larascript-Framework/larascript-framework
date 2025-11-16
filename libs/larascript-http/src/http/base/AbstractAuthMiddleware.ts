import { HttpEnvironment } from "@/http/environment/HttpEnvironment.js";
import ConfigException from "../exceptions/ConfigException.js";
import Middleware from "./Middleware.js";

export abstract class AbstractAuthMiddleware<Config extends unknown = unknown> extends Middleware<Config> {

    constructor() {
        super();
        if (!HttpEnvironment.getInstance().isAuthConfigured()) {
            throw new ConfigException('Auth service not configured');
        }
    }

}
