import { IApiTokenAttributes, IApiTokenModel, IApiTokenRepository } from "@larascript-framework/contracts/auth";
import { Repository } from "@larascript-framework/larascript-database";
import ApiToken from "../models/ApiToken.js";

export class ApiTokenRepository extends Repository<ApiToken> implements IApiTokenRepository {
    
    constructor() {
        super(ApiToken)
    }

    async create(attributes?: IApiTokenAttributes): Promise<IApiTokenModel> {
        const apiToken = this.modelConstructor.create(attributes as unknown as ApiToken['attributes'])
        await apiToken.save()
        return apiToken
    }

    async findOneActiveToken(token: string): Promise<IApiTokenModel | null> {
        return await this.query()
            .where(ApiToken.TOKEN, token)
            .whereNull(ApiToken.REVOKED_AT)
            .first()
    }

    async revokeToken(apiToken: ApiToken): Promise<void> {
        await apiToken.setAttribute('revokedAt', new Date())
        await apiToken.save()
    }

    async revokeAllTokens(userId: string | number): Promise<void> {
        await this.query()
            .where(ApiToken.USER_ID, userId)
            .update({ [ApiToken.REVOKED_AT]: new Date() })
    }
}

export default ApiTokenRepository;