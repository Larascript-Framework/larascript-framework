import { IHttpContext } from "@larascript-framework/contracts/http";
import { CustomValidatorConstructor } from "@larascript-framework/larascript-validator";
import Middleware from "../base/Middleware.js";

/**
 * Validator middleware for validating the request body
 * 
 * This middleware validates the request body against the validator constructor
 * and sets the validated body on the request.
 */
export class ValidatorMiddleware extends Middleware {

    /**
     * Executes the validator middleware
     * @param context - The HTTP context
     */
    public async execute(context: IHttpContext): Promise<void> {
        const validatorConstructors = this.getValidatorConstructors(context);

        // No validator constructor, skip validation
        if (validatorConstructors.length === 0) {
            this.next();
            return;
        }

        for (const validatorConstructor of validatorConstructors) {
            
            const validator = new validatorConstructor();
            validator.setRuleContext({ 
                httpContext: context
            })

            const data = context.getValidatorBody()
            const result = await validator.validate(data);

            // Validation failed, return the errors
            if (result.fails()) {
                context.getResponse().status(422).json({
                    errors: result.errors()
                });
                return;
            }

            // Set the validated body on the request
            context.getRequest().body = { ...context.getRequest().body, ...result.validated() };
        }

        this.next();
    }

    /**
     * Get the validator constructor from the route item
     * @param context - The HTTP context
     * @returns The validator constructor
     */
    protected getValidatorConstructors(context: IHttpContext): CustomValidatorConstructor[] {
        const validatorConstructors = context.getRouteItem()?.validator ?? [];
        return Array.isArray(validatorConstructors) ? validatorConstructors : [validatorConstructors];
    }

}

export default ValidatorMiddleware;
