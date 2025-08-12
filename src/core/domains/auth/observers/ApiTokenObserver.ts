import { Observer } from "@ben-shepherd/larascript-observer-bundle";
import UserRepository from "@src/app/repositories/auth/UserRepository";
import { ApiTokenAttributes } from "@src/core/domains/auth/models/ApiToken";
import { auth } from "@src/core/domains/auth/services/AuthService";
import { authJwt } from "@src/core/domains/auth/services/JwtAuthService";

interface IApiTokenObserverData extends ApiTokenAttributes {}

export default class ApiTokenObserver extends Observer<IApiTokenObserverData> {  
    
    protected readonly userRepository = new UserRepository();

    /**
     * Called when a data object is being created.
     * @param data The model data being created.
     * @returns The processed model data.
     */
    async creating(data: IApiTokenObserverData): Promise<IApiTokenObserverData> {
        data = await this.addGroupScopes(data)
        return data
    }

    /**
     * Adds scopes from groups the user is a member of to the scopes of the ApiToken being created.
     * @param data The ApiToken data being created.
     * @returns The ApiToken data with the added scopes.
     */

    async addGroupScopes(data: IApiTokenObserverData): Promise<IApiTokenObserverData> {
        const user = await authJwt().getUserRepository().findByIdOrFail(data.userId)

        if(!user) {
            return data
        }

        const userGroups = user.getAclGroups() ?? []

        for(const userGroup of userGroups) {
            const scopes = auth().acl().getGroupScopes(userGroup)

            data.scopes = [
                ...data.scopes,
                ...scopes
            ]
        }

        return data
    }

}