import { IHttpContext } from "@larascript-framework/contracts/http";
import ValidatorException from "../exceptions/ValidatorException.js";
import AbstractRule from "./AbstractRule.js";

/**
 * Abstract rule with HTTP context
 */
abstract class AbstractRuleHttpContext<TOptions extends object = object> extends AbstractRule<TOptions> {

    getHttpContext(): IHttpContext {
        if(typeof this.getContext<IHttpContext>("httpContext") === "undefined") {
            throw new ValidatorException("httpContext context has not been set")
        }

        return this.getContext<IHttpContext>("httpContext")!
    }

}


export default AbstractRuleHttpContext