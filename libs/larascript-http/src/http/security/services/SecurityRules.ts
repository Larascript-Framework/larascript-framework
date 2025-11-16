import { ISecurityRule, TSecurityRuleConstructor } from "@larascript-framework/contracts/http";
import HasRoleRule from "../rules/HasRoleRule.js";
import RateLimitedRule from "../rules/RateLimitedRule.js";
import ResourceOwnerRule from "../rules/ResourceOwnerRule.js";
import ScopeRule from "../rules/ScopeRule.js";


class SecurityRules {

    /**
     * Creates a new security rule.
     * 
     * @param options The options for the security rule
     * @returns The security rule
     */
    public static create<Rule extends ISecurityRule = ISecurityRule>(ruleConstructor: TSecurityRuleConstructor<Rule>, options?: Rule extends ISecurityRule<infer O> ? O : object): Rule {
        return new ruleConstructor().setRuleOptions(options ?? {}) as Rule;
    }

    /**
     * Creates a new resource owner security rule.
     * 
     * @param attribute The attribute of the resource that contains the owner ID
     * @returns The resource owner security rule
     */
    public static resourceOwner(attribute: string = 'userId'): ResourceOwnerRule {
        return this.create(ResourceOwnerRule, { 
            attribute: attribute
        });
    }

    /**
     * Creates a new has role security rule.
     * 
     * @param roles The roles to check
     * @returns The has role security rule
     */
    public static hasRole(roles: string | string[]): HasRoleRule {
        return this.create(HasRoleRule, {
            roles: roles
        });
    }

    /**
     * Creates a new enable scopes security rule.
     * 
     * @param scopes The scopes to check
     * @returns The enable scopes security rule
     */
    public static scopes(scopes: string | string[], exactMatch: boolean = true): ScopeRule {
        return this.create(ScopeRule, {
            scopes: scopes,
            exactMatch: exactMatch
        });
    }

    /**
     * Creates a new rate limited security rule.
     * 
     * @param limit The limit of requests per minute
     * @param perMinuteAmount The amount of minutes to check
     * @returns The rate limited security rule
     */
    public static rateLimited(limit: number, perMinuteAmount: number): RateLimitedRule {
        return this.create(RateLimitedRule, {
            limit: limit,
            perMinuteAmount: perMinuteAmount
        });
    }

}

export default SecurityRules;