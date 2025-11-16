import { AbstractAuthMiddleware } from "@/http/base/AbstractAuthMiddleware.js";
import { HttpEnvironment } from "@/http/index.js";
import { IHttpContext, MiddlewareConstructor } from "@larascript-framework/contracts/http";
import { IUserModel } from "@larascript-framework/larascript-auth";

/**
 * Creates a mock authorize user middleware
 * @param user - The user to authorize
 * @returns The mock authorize user middleware
 */
export const createMockAuthorizeUserMiddleware = (user: IUserModel): MiddlewareConstructor => {
    return class extends AbstractAuthMiddleware {
        async execute(context: IHttpContext): Promise<void> {
            await HttpEnvironment.getInstance().authEnvironment.authorizeUser(user);
            context.getRequest().user = user;
            this.next();
        }
    }
}