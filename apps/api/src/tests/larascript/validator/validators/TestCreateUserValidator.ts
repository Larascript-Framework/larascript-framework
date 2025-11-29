import User from "@/app/models/auth/User.js";
import {
  BaseCustomValidator,
  EmailRule,
  IRulesObject,
  MinRule,
  RequiredRule,
  StringRule,
  UniqueRule,
} from "@larascript-framework/larascript-validator";

class TestCreateUserValidator extends BaseCustomValidator {
  protected rules: IRulesObject = {
    email: [new RequiredRule(), new EmailRule(), new UniqueRule(User, "email")],
    password: [new RequiredRule(), new MinRule(6)],
    firstName: [new RequiredRule(), new StringRule()],
    lastName: [new RequiredRule(), new StringRule()],
  };

  protected messages: Record<string, string> = {
    "email.unique": "The email has already been taken.",
  };
}

export default TestCreateUserValidator;
