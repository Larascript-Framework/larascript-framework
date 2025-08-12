import { AbstractRule, ValidatorException } from "@ben-shepherd/larascript-validator";

import HttpContext from "../../http/context/HttpContext";

abstract class ExtendedAbstractRule<TOptions extends object = object> extends AbstractRule<TOptions> {

    getHttpContext(): HttpContext {
        const httpContext = this.getContext<HttpContext>("httpContext")

        if(typeof httpContext === "undefined") {
            throw new ValidatorException("httpContext context has not been set")
        }

        return httpContext
    }

}


export default ExtendedAbstractRule