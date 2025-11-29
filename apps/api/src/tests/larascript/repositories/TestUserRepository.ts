import TestUser from "@/tests/larascript/models/models/TestUser.js";
import {
  AuthenticableUserModel,
  AuthenticationUserRepository,
} from "@larascript-framework/larascript-auth";

export default class TestUserRepository extends AuthenticationUserRepository<AuthenticableUserModel> {
  constructor() {
    super(TestUser);
  }
}
