import { MinRule, NullableRule, StringRule } from "@ben-shepherd/larascript-validator-bundle";
import BaseCustomValidator from "@src/core/domains/validator/base/BaseCustomValidator";
import { IRulesObject } from "@src/core/domains/validator/interfaces/IRule";

class TestUpdateUserValidator extends BaseCustomValidator {

    protected rules: IRulesObject = {
        password: [new NullableRule(), new MinRule(6)],
        firstName: [new NullableRule(), new StringRule()],
        lastName: [new NullableRule(), new StringRule()]
    }

}

export default TestUpdateUserValidator