import { IUserAttributes, IUserRepository } from "@larascript-framework/contracts/auth";
import { ModelConstructor, Repository } from "@larascript-framework/larascript-database";
import AuthenticableUserModel from "../models/AuthenticableUserModel.js";

/**
 * Repository class for managing user data operations
 * 
 * This repository extends the base Repository class and implements IUserRepository interface.
 * It provides methods for creating, finding and managing user records in the database.
 * 
 * Key features:
 * - Create new user records
 * - Find users by ID with optional fail behavior
 * - Find users by email
 * - Uses Eloquent query builder for database operations
 * 
 * @extends Repository<IUserModel>
 * @implements IUserRepository
 */

export class AuthenticationUserRepository<T extends AuthenticableUserModel> extends Repository<T> implements IUserRepository {

    constructor(modelConstructor: ModelConstructor<T>) {
        super(modelConstructor);
    }

    /**
     * Create a new user record
     * 
     * @param attributes - The attributes for the new user record
     * @returns The newly created user record
     */
    async create(attributes: IUserAttributes): Promise<T> {
        const user = this.modelConstructor.create(attributes as unknown as T['attributes'])
        await user.save()
        return user
    }

    /**
     * Find a user by their ID
     * 
     * @param id - The ID of the user to find
     * @returns The user record or null if not found
     */
    async findById(id: string | number): Promise<T | null> {
        return await this.query().find(id) as T | null
    }

    /**
     * Find a user by their ID and fail if not found
     * 
     * @param id - The ID of the user to find
     * @returns The user record
     */
    async findByIdOrFail(id: string | number): Promise<T> {
        return await this.query().findOrFail(id) as T
    }

    /**
     * Find a user by their email
     * 
     * @param email - The email of the user to find
     * @returns The user record or null if not found
     */
    async findByEmail(email: string): Promise<T | null> {
        return await this.query().where('email', email).first()
    }

}

export default AuthenticationUserRepository;


