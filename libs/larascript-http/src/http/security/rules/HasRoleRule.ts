import HttpContext from "@/http/context/HttpContext.js";
import { SecurityEnum } from "@/http/enums/SecurityEnum.js";
import { ForbiddenResourceError } from "@/http/exceptions/ForbiddenResourceError.js";
import SecurityException from "@/http/exceptions/SecurityException.js";
import AbstractSecurityRule from "@/http/security/abstract/AbstractSecurityRule.js";

type HasRoleConfig = {
    roles: string | string[];
}

class HasRoleRule extends AbstractSecurityRule<HasRoleConfig> {

    protected readonly id = SecurityEnum.HAS_ROLE;

    async execute(context: HttpContext): Promise<boolean> {
        const user = context.getUser();

        if(!user) {
            return false;
        }

        const roles = this.getRuleOptions().roles;

        if(!roles) {
            throw new SecurityException('Roles are required');
        }

        const rolesArr = Array.isArray(roles) ? roles : [roles];

        if(rolesArr.length === 0) {
            throw new SecurityException('No roles provided');
        }

        const containsRoles = user.getAclRoles()?.some(role => rolesArr.includes(role)) ?? false;

        if(!containsRoles) {
            throw new ForbiddenResourceError('User does not have the required roles');
        }

        return true;
    }

}

export default HasRoleRule;