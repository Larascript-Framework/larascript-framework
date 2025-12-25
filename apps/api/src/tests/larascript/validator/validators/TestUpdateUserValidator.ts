import {
  BaseCustomValidator,
  IRulesObject,
  MinRule,
  NullableRule,
  StringRule,
} from "@larascript-framework/larascript-validator";

class TestUpdateUserValidator extends BaseCustomValidator {
  protected rules: IRulesObject = {
    password: [new NullableRule(), new MinRule(6)],
    firstName: [new NullableRule(), new StringRule()],
    lastName: [new NullableRule(), new StringRule()],
  };
}

export default TestUpdateUserValidator;
