import User from "@/app/models/auth/User.js";
import {
  BaseCustomValidator,
  EmailRule,
  IRulesObject,
  MinRule,
  NullableRule,
  RequiredRule,
  StringRule,
  UniqueRule,
} from "@larascript-framework/larascript-validator";

class CreateUserValidator extends BaseCustomValidator {
  protected rules: IRulesObject = {
    email: [new RequiredRule(), new EmailRule(), new UniqueRule(User, "email")],
    password: [new RequiredRule(), new MinRule(6)],
    firstName: [new NullableRule(), new StringRule()],
    lastName: [new NullableRule(), new StringRule()],
  };

  protected messages: Record<string, string> = {
    "email.unique": "The email has already been taken.",
  };
}

export default CreateUserValidator;
