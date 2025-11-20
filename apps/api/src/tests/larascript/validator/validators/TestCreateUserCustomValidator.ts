import User from "@/app/models/auth/User.js";
import { BaseCustomValidator, EmailRule, IRulesObject, IValidatorAttributes, MinRule, RequiredRule, StringRule, UniqueRule } from "@larascript-framework/larascript-validator";
class TestCreateUserValidator extends BaseCustomValidator {

    protected rules: IRulesObject = {
        email: [new RequiredRule(), new EmailRule(), new UniqueRule(User, 'email')],
        password: [new RequiredRule(), new MinRule(6)],
        firstName: [new RequiredRule(), new StringRule()],
        lastName: [new RequiredRule(), new StringRule()]
    }

    public async customValidation(data: IValidatorAttributes): Promise<boolean> {
        if(data.firstName !== 'John') {
            this.addErrors({
                'firstName.custom': ['The first name should be John']
            })
            return false
        }
        return true
    }

}

export default TestCreateUserValidator