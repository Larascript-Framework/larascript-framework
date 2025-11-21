import { UnauthorizedException } from '@larascript-framework/larascript-auth';
import HttpContext from '../context/HttpContext.js';
import { HttpEnvironment } from '../environment/HttpEnvironment.js';
import responseError from '../handlers/responseError.js';
import AuthorizeMiddleware from './AuthorizeMiddleware.js';

export class OneTimeTokenMiddleware extends AuthorizeMiddleware {

    async execute(context: HttpContext): Promise<void> {
        try {
            await this.attemptAuthorizeRequest(context.getRequest())
            
            const apiToken = context.getApiToken()

            if (!apiToken) {
                throw new UnauthorizedException()
            }

            const validOneTimeToken = HttpEnvironment.getInstance().authService.getJwt().oneTimeService().validateSingleUseToken(apiToken)  

            if (!validOneTimeToken) {
                throw new UnauthorizedException()
            }

            await HttpEnvironment.getInstance().authService.getJwt().revokeToken(apiToken)

            this.next();
        }
        catch (error) {
            if (error instanceof UnauthorizedException) {
                responseError(context.getRequest(), context.getResponse(), error, 401)
            }
        }
    }



}

export default OneTimeTokenMiddleware;