import User from "../models/User.js";
import AuthenticationUserRepository from "./AuthenticationUserRepository.js";


export class UserRepository extends AuthenticationUserRepository<User> {
    constructor() {
        super(User)
    }
}

export default UserRepository;