import { UserAttributes } from "@/app/models/auth/User.js";
import { Observer } from "@larascript-framework/larascript-observer";

/**
 * Observer for the User model.
 */
export default class UserObserver extends Observer<UserAttributes> {

    async creating(data: UserAttributes): Promise<UserAttributes> {
        return data
    }

}
