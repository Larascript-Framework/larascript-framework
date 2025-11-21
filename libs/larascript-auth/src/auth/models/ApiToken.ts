import { TCastableType } from '@larascript-framework/cast-js';
import { IApiTokenAttributes, IApiTokenModel } from '@larascript-framework/contracts/auth';
import { BasicACLScope } from '@larascript-framework/larascript-acl';
import { BelongsTo, IModelAttributes, Model } from '@larascript-framework/larascript-database';
import ApiTokenObserver from '../observers/ApiTokenObserver.js';
import User from './User.js';

export interface ApiTokenAttributes extends IModelAttributes, IApiTokenAttributes {}

/**
 * ApiToken model
 *
 * Represents an API token that can be used to authenticate a user.
 */
export class ApiToken extends Model<ApiTokenAttributes> implements IApiTokenModel {

    public static readonly USER_ID = 'userId';

    public static readonly TOKEN = 'token';

    public static readonly SCOPES = 'scopes';

    public static readonly OPTIONS = 'options';

    public static readonly REVOKED_AT = 'revokedAt';

    public static readonly EXPIRES_AT = 'expiresAt';

    public static readonly RELATIONSHIP_USER = 'user';

    /**
     * Required ApiToken fields
     *
     * @field userId The user this token belongs to
     * @field token The token itself
     * @field revokedAt The date and time the token was revoked (null if not revoked)
     */
    public fields: string[] = [
        ApiToken.USER_ID,
        ApiToken.TOKEN,
        ApiToken.SCOPES,
        ApiToken.OPTIONS,
        ApiToken.REVOKED_AT,
        ApiToken.EXPIRES_AT,
        ApiToken.CREATED_AT,
        ApiToken.UPDATED_AT,
    ]

    protected casts?: Record<string, TCastableType> | undefined = {
        [ApiToken.REVOKED_AT]: 'date',
        [ApiToken.EXPIRES_AT]: 'date',
        [ApiToken.OPTIONS]: 'object',
    }

    public json: string[] = [
        ApiToken.SCOPES,
    ]

    public relationships: string[] = [
        ApiToken.RELATIONSHIP_USER
    ]

    public timestamps: boolean = true;

    /**
     * Construct an ApiToken model from the given data.
     *
     * @param {ApiTokenAttributes} [data=null] The data to construct the model from.
     *
     * @constructor
     */
    constructor(data: ApiTokenAttributes | null = null) {
        super(data)
        this.setObserverConstructor(ApiTokenObserver)
    }

    getId(): string {
        return (this.getAttributeSync(ApiToken.ID) ?? '') as string
    }


    /**
     * Get the user id
     * @returns {string} The user id
     */
    getUserId(): string {
        return this.getAttributeSync(ApiToken.USER_ID) as string
    }

    /**
     * Set the user id
     * @param {string} userId The user id
     * @returns {Promise<void>} A promise that resolves when the user id is set
     */
    setUserId(userId: string): Promise<void> {
        return this.setAttribute(ApiToken.USER_ID, userId)
    }

    /**
     * Get the token
     * @returns {string} The token
     */
    getToken(): string {
        return this.getAttributeSync(ApiToken.TOKEN) as string
    }

    /**
     * Set the token
     * @param {string} token The token
     * @returns {Promise<void>} A promise that resolves when the token is set
     */
    setToken(token: string): Promise<void> {
        return this.setAttribute(ApiToken.TOKEN, token)
    }

    /**
     * Get the revoked at
     * @returns {Date | null} The revoked at
     */
    getRevokedAt(): Date | null {
        return this.getAttributeSync(ApiToken.REVOKED_AT) as Date | null
    }

    /**
     * Set the revoked at
     * @param {Date | null} revokedAt The revoked at
     * @returns {Promise<void>} A promise that resolves when the revoked at is set
     */
    setRevokedAt(revokedAt: Date | null): Promise<void> {
        return this.setAttribute(ApiToken.REVOKED_AT, revokedAt)
    }

    /**
     * Get the scopes
     * @returns {string[]} The scopes
     */
    getScopes(): string[] {
        return this.getAttributeSync(ApiToken.SCOPES) as string[]
    }

    /**
     * Set the scopes
     * @param {string[]} scopes The scopes
     * @returns {Promise<void>} A promise that resolves when the scopes are set
     */
    setScopes(scopes: string[]): Promise<void> {
        return this.setAttribute(ApiToken.SCOPES, scopes)
    }

    setExpiresAt(expiresAt: Date): Promise<void> {
        return this.setAttribute(ApiToken.EXPIRES_AT, expiresAt)
    }

    getExpiresAt(): Date | null {
        return this.getAttributeSync(ApiToken.EXPIRES_AT) as Date | null
    }

    /**
     * Fetches the user that this ApiToken belongs to.
     *
     * @returns A BelongsTo relationship that resolves to the user model.
     */
    user(): BelongsTo {
        return this.belongsTo(User, {
            localKey: ApiToken.USER_ID,
            foreignKey: 'id',
        })
    }

    /**
     * Checks if the given scope(s) are present in the scopes of this ApiToken
     * @param scopes The scope(s) to check
     * @returns True if all scopes are present, false otherwise
     */
    hasScope(scopes: string | string[], exactMatch: boolean = true): boolean {
        scopes = Array.isArray(scopes) ? scopes : [scopes]
        const currentScopes = this.getAttributeSync('scopes') ?? [];

        if (exactMatch && currentScopes.length !== scopes.length) {
            return false
        }
        if (exactMatch) {
            return BasicACLScope.exactMatch(currentScopes, scopes);
        }

        return BasicACLScope.partialMatch(currentScopes, scopes);
    }

    /**
     * Sets the options for this API token
     * @param {Record<string, unknown>} options - The options to set for this token
     * @returns {Promise<void>} A promise that resolves when the options are set
     */
    async setOptions(options: Record<string, unknown>): Promise<void> {
        await this.setAttribute(ApiToken.OPTIONS, options)
    }

    /**
     * Gets the options for this API token
     * @template T - The type of the options object
     * @returns {T | null} The options for this token, or null if no options are set
     */
    getOptions<T extends Record<string, unknown>>(): T | null {
        return (this.getAttributeSync('options') ?? null) as T | null
    }

    /**
     * Checks if this API token has expired
     * @returns {boolean} True if the token has expired, false otherwise
     */
    hasExpired(): boolean {
        const expiresAt = (this.getAttributeSync(ApiToken.EXPIRES_AT) ?? null) as Date | null

        if (!(expiresAt instanceof Date)) {
            return false
        }

        return new Date() > expiresAt
    }

}

export default ApiToken
