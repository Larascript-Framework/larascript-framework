import HttpContext from "@/http/context/HttpContext.js";
import { SecurityEnum } from "@/http/enums/SecurityEnum.js";
import { HttpEnvironment } from "@/http/environment/HttpEnvironment.js";
import SecurityException from "@/http/exceptions/SecurityException.js";
import { UnauthorizedException } from "@/http/exceptions/UnauthorizedException.js";
import AbstractSecurityRule from "../abstract/AbstractSecurityRule.js";

export type ScopeRuleConfig = {
    scopes: string | string[];
    exactMatch: boolean
}

class ScopeRule extends AbstractSecurityRule<ScopeRuleConfig> {

    protected readonly id = SecurityEnum.ENABLE_SCOPES;
    
    protected conditionsNotSupported: boolean = true;

    public async execute(context: HttpContext): Promise<boolean> {

        if(!await HttpEnvironment.getInstance().authService.check()) {
            throw new UnauthorizedException();
        }

        const apiToken = context.getApiToken();

        if(!apiToken) {
            return false;
        }

        const scopes = this.getRuleOptions().scopes;

        if(!scopes) {
            throw new SecurityException('Scopes are required');
        }

        const scopesArr = Array.isArray(scopes) ? scopes : [scopes];

        if(scopesArr.length === 0) {
            throw new SecurityException('No scopes provided');
        }
        
        const exactMatch = this.getRuleOptions().exactMatch;

        return apiToken.hasScope(scopesArr, exactMatch);
    }

}

export default ScopeRule;