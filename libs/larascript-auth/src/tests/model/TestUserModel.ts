import {
  BaseModel,
  BaseModelAttributes,
} from "@larascript-framework/test-helpers";
import { IUserModel } from "../../auth/index.js";

export interface ITestUserAttributes extends BaseModelAttributes {
  id: string;
  email: string;
  hashedPassword: string;
  aclRoles: string[];
  aclGroups: string[];
}

class TestUserModel
  extends BaseModel<ITestUserAttributes>
  implements IUserModel
{
  getId(): string {
    return this.attributes.id;
  }

  getEmail(): string | null {
    return this.attributes.email;
  }

  async setEmail(email: string): Promise<void> {
    this.attributes.email = email;
  }

  getHashedPassword(): string | null {
    return this.attributes.hashedPassword;
  }

  async setHashedPassword(hashedPassword: string): Promise<void> {
    this.attributes.hashedPassword = hashedPassword;
  }

  getAclRoles(): string[] | null {
    return this.attributes.aclRoles;
  }

  async setAclRoles(roles: string[]): Promise<void> {
    this.attributes.aclRoles = roles;
  }
  getAclGroups(): string[] | null {
    return this.attributes.aclGroups;
  }

  async setAclGroups(groups: string[]): Promise<void> {
    this.attributes.aclGroups = groups;
  }
}

export default TestUserModel;
