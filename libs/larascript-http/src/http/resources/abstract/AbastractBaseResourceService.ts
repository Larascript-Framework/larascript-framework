
import HttpContext from "@/http/context/HttpContext.js";
import { SecurityEnum } from "@/http/enums/SecurityEnum.js";
import { HttpEnvironment } from "@/http/environment/HttpEnvironment.js";
import ResourceException from "@/http/exceptions/ResourceException.js";
import ApiResponse from "@/http/response/ApiResponse.js";
import ResourceOwnerRule from "@/http/security/rules/ResourceOwnerRule.js";
import SecurityReader from "@/http/security/services/SecurityReader.js";
import Paginate from "@/http/utils/Paginate.js";
import { IUserModel } from "@larascript-framework/contracts/auth";
import { ModelConstructor } from "@larascript-framework/contracts/database/model";
import { IApiResponse, IHttpContext, IResourceData, TRouteItem } from "@larascript-framework/contracts/http";
import { CustomValidatorConstructor, IValidatorErrors } from "@larascript-framework/larascript-validator";

type TResponseOptions = {} | {
    showPagination: boolean;
    paginate: Paginate;
}

/**
 * BaseResourceService is an abstract base class for handling CRUD operations on resources.
 * It provides common functionality for:
 * 
 * - Authorization validation
 * - Resource owner security validation 
 * - Resource attribute access control
 *
 * This class is extended by specific resource services like:
 * - ResourceIndexService (listing resources)
 * - ResourceShowService (showing single resource)
 * - ResourceCreateService (creating resources)
 * - ResourceUpdateService (updating resources) 
 * - ResourceDeleteService (deleting resources)
 *
 * Each child class implements its own handler() method with specific CRUD logic
 * while inheriting the security and validation methods from this base class.
 */

export abstract class AbastractBaseResourceService {

    /**
     * The route resource type (RouteResourceTypes)
     */
    abstract routeResourceType: string;

    // eslint-disable-next-line no-unused-vars
    abstract handler(context: IHttpContext): Promise<IApiResponse>;

    /**
     * Cached authorized value
     */
    declare cachedAuthorized: boolean | undefined;

    /**
     * Cached access as guest value
     */
    declare cachedAccessAsGuest: boolean | undefined;

    /**
     * Gets the normalized database primary key
     * @param modelConstructor 
     * @returns 
     */
    getPrimaryKey(modelConstructor: ModelConstructor): string {
        return HttpEnvironment.getInstance().databaseService.getAdapter().normalizeColumn(modelConstructor.getPrimaryKey())
    }

    /**
     * Gets the model constructor from the route options
     * @param {HttpContext} context - The HTTP context
     * @returns {ModelConstructor} - The model constructor
     * @throws {ResourceException} - If the route options are not found
     * @deprecated Use getDataSourceRepository instead
     */
    getModelConstructor(context: HttpContext): ModelConstructor {
        const routeOptions = context.getRouteItem()

        if (!routeOptions) {
            throw new ResourceException('Route options are required')
        }

        const modelConstructor = (routeOptions?.resource as any)?.modelConstructor as ModelConstructor

        if (!modelConstructor) {
            throw new ResourceException('Model constructor is not set')
        }

        return modelConstructor
    }

    /**
     * Checks if the request is authorized to perform the action or allowed to access the resource as a guest
     * @param context 
     * @returns 
     */
    async validateAuthorizedOrAccessAsGuest(context: HttpContext): Promise<boolean> {
        return await this.validateAuthorized() || await this.validateAccessAsGuest(context);
    }

    /**
     * Checks if the request is authorized to perform the action
     * 
     * @param {BaseRequest} req - The request object
     * @param {IRouteResourceOptionsLegacy} options - The options object

     * @returns {boolean} - Whether the request is authorized
     */
    async validateAuthorized(): Promise<boolean> {
        if(this.cachedAuthorized !== undefined) {
            return this.cachedAuthorized;
        }

        this.cachedAuthorized = await HttpEnvironment.getInstance().authService.check()
        return this.cachedAuthorized;
    }

    /**
     * Checks if the request is allowed to access the resource as a guest
     * - If the allowUnauthenticated is a boolean, return it
     * - If the allowUnauthenticated is an object, return the value of the routeResourceType
     * - If the allowUnauthenticated is not set, return false
     * 
     * @param context 
     * @returns 
     */
    async validateAccessAsGuest(context: HttpContext): Promise<boolean> {
        if(this.cachedAccessAsGuest !== undefined) {
            return this.cachedAccessAsGuest;
        }

        const allowUnauthenticated = context.resourceContext.options.allowUnauthenticated;

        if (typeof allowUnauthenticated === 'boolean') {
            this.cachedAccessAsGuest = allowUnauthenticated;
            return this.cachedAccessAsGuest;
        }
        else if (typeof allowUnauthenticated === 'object') {
            this.cachedAccessAsGuest = allowUnauthenticated[this.routeResourceType] ?? false;
            return this.cachedAccessAsGuest as boolean;
        }

        this.cachedAccessAsGuest = false;
        return false;
    }

    /**
     * Checks if the request is authorized to perform the action and if the resource owner security is set
     * 
     * @param {BaseRequest} req - The request object
     * @param {IRouteResourceOptionsLegacy} options - The options object
     * @returns {boolean} - Whether the request is authorized and resource owner security is set
     */
    async validateResourceOwnerApplicable(context: HttpContext): Promise<boolean> {

        // Resource owner is only applicable if the request is authorized
        if(!await this.validateAuthorized()) {
            return false;
        }

        const routeOptions = context.getRouteItem()

        if (!routeOptions) {
            throw new ResourceException('Route options are required')
        }

        const resourceOwnerSecurity = this.getResourceOwnerRule(routeOptions);

        if (await this.validateAuthorized() && resourceOwnerSecurity) {

            // Check if the resource owner attribute is the same as the expected resource owner attribute
            this.validateResourceOwnerAttributeMatchesSecurityRuleAttribute(context, resourceOwnerSecurity);

            return true;
        }

        return false;
    }

    /**
     * Validates the resource owner attribute is the same as the expected resource owner attribute
     * @param context 
     * @param resourceOwnerSecurity 
     */
    private validateResourceOwnerAttributeMatchesSecurityRuleAttribute(context: HttpContext, resourceOwnerSecurity: ResourceOwnerRule) {
        const expectedResourceOwnerAttribute = context.resourceContext.repository.getResourceOwnerAttribute();

        if (!expectedResourceOwnerAttribute) {
            throw new ResourceException('The resource owner attribute is not set');
        }

        if (expectedResourceOwnerAttribute !== (resourceOwnerSecurity as ResourceOwnerRule).getRuleOptions()?.attribute) {
            throw new ResourceException('Expected the resource owner attribute to be ' + expectedResourceOwnerAttribute + ' but received ' + (resourceOwnerSecurity as ResourceOwnerRule).getRuleOptions()?.attribute);
        }
    }

    /**
     * Checks if the request is authorized to perform the action and if the resource owner security is set
     * 
     * @param {BaseRequest} req - The request object
     * @param {IRouteResourceOptionsLegacy} options - The options object
     * @returns {boolean} - Whether the request is authorized and resource owner security is set
     */
    async validateResourceAccess(context: HttpContext, resource: IResourceData): Promise<boolean> {
        const routeOptions = context.getRouteItem()

        if (!routeOptions) {
            throw new ResourceException('Route options are required')
        }

        const resourceOwnerSecurity = this.getResourceOwnerRule(routeOptions);

        // If the resource owner security is not set, we allow access
        if (!resourceOwnerSecurity) {
            return true;
        }

        // Get the attribute from the resource owner security
        const attribute = resourceOwnerSecurity.getRuleOptions()?.attribute as string

        if (!attribute) {
            throw new ResourceException('An attribute is required to check resource owner security')
        }

        if (!Object.keys(resource).includes(attribute)) {
            throw new ResourceException('The attribute ' + attribute + ' is not a valid attribute for the resource ' + resource.constructor.name)
        }

        // Get the resource owner id
        const resourceOwnerId = resource?.[attribute]

        if (!resourceOwnerId) {
            return false;
        }

        // Get the request user id
        const user = await this.getUser()

        if (!user) {
            return false;
        }

        return resourceOwnerId === user.getId();
    }

    /**
     * Finds the resource owner security from the given options
     * @param {TRouteItem} routeOptions - The options object
     * @returns {IIdentifiableSecurityCallback | undefined} - The found resource owner security or undefined if not found
     */
    getResourceOwnerRule(routeOptions: TRouteItem): ResourceOwnerRule | undefined {
        const id = SecurityEnum.RESOURCE_OWNER;
        const when = [this.routeResourceType];
        return SecurityReader.find<ResourceOwnerRule>(routeOptions, id, when);
    }

    /**
     * Gets the resource owner property key from the route options
     * @param {TRouteItem} routeOptions - The route options
     * @param {string} defaultKey - The default key to use if the resource owner security is not found
     * @returns {string} - The resource owner property key
     */
    getResourceAttribute(routeOptions: TRouteItem, defaultKey: string = 'userId'): string {
        const resourceOwnerSecurity = this.getResourceOwnerRule(routeOptions)
        const attribute = resourceOwnerSecurity?.getRuleOptions()?.attribute as string ?? defaultKey;

        if (typeof attribute !== 'string') {
            throw new ResourceException('Malformed resourceOwner security. Expected parameter \'attribute\' to be a string but received ' + typeof attribute);
        }

        return attribute;
    }

    /**
     * Gets the validator by type
     * @param {HttpContext} context - The HTTP context
     * @returns {ValidatorConstructor | undefined} - The validator or undefined if not found
     */
    getValidator(context: HttpContext): CustomValidatorConstructor | undefined {
        const routeOptions = context.getRouteItem()

        if (!routeOptions) {
            throw new ResourceException('Route options are required')
        }

        const validator = routeOptions.resource?.validation?.[this.routeResourceType] as CustomValidatorConstructor | undefined

        if (!validator) {
            return undefined;
        }

        return validator;
    }

    /**
     * Validates the request body using the configured validator for this resource type
     * @param {HttpContext} context - The HTTP context containing the request to validate
     * @returns {Promise<void>} A promise that resolves when validation is complete
     * @throws {ValidationError} If validation fails
     */
    async getValidationErrors(context: HttpContext): Promise<IValidatorErrors | undefined> {
        const validatorConstructor = this.getValidator(context)

        if (!validatorConstructor) {
            return undefined;
        }

        const validator = new validatorConstructor()
        validator.setRuleContext({
            httpContext: context
        })
        
        const data = context.getValidatorBody()
        const result = await validator.validate(data)

        if (result.fails()) {
            return result.errors()
        }

        return undefined;
    }

    /**
     * Builds and returns the final response object with all added data and metadata
     * @param {HttpContext} context - The HTTP context
     * @param {unknown} data - The data to be included in the response
     * @param {number} code - The HTTP status code  
     */
    apiResponse<Data = unknown>(context: HttpContext, data: Data, code: number = 200, options?: TResponseOptions): ApiResponse<Data> {
        const apiResponse = new ApiResponse<Data>()
        const paginate = new Paginate()
        const pagination = paginate.parseRequest(context.getRequest())

        apiResponse.setCode(code)
        apiResponse.setData(data)
        apiResponse.addTotalCount()

        if (options && 'showPagination' in options && options.paginate) {
            apiResponse.addPagination(options.paginate)
        }

        return apiResponse
    }

    /**
     * Gets the user from the request
     * @returns {Promise<IHttpUser | null>} - The user or null if not found
     */
    async getUser(): Promise<IUserModel | null> {
        return await HttpEnvironment.getInstance().authService.user()
    }

}



export default AbastractBaseResourceService;