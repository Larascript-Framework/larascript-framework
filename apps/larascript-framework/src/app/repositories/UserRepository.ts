import User from "@/app/models/auth/User.js";
import { AuthenticationUserRepository } from "@larascript-framework/larascript-auth";

export class UserRepository extends AuthenticationUserRepository<User> {
    constructor() {
        super(User)
    }
}

export default UserRepository;