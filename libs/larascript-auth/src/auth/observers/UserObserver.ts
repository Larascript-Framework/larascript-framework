import { IUserAttributes } from "@larascript-framework/contracts/auth";
import { Observer } from "@larascript-framework/larascript-observer";

/**
 * Observer for the User model.
 * 
 * Automatically hashes the password on create/update if it is provided.
 */
export default class UserObserver extends Observer<IUserAttributes> {


}
