import HttpContext from "@/http/context/HttpContext.js";
import ResourceException from "@/http/exceptions/ResourceException.js";
import { ResourceNotFoundException } from "@/http/exceptions/ResourceNotFoundException.js";
import { UnauthorizedException } from "@/http/exceptions/UnauthorizedException.js";
import ApiResponse from "@/http/response/ApiResponse.js";
import { IModelAttributes } from "@larascript-framework/contracts/database/model";
import { IResourceData, RouteResourceTypes, TResponseErrorMessages } from "@larascript-framework/contracts/http";
import { ForbiddenResourceError } from "../../exceptions/ForbiddenResourceError.js";
import AbastractBaseResourceService from "../abstract/AbastractBaseResourceService.js";

/**
 * Service class that handles updating existing resources through HTTP requests
 * 
 * This service:
 * - Validates authorization for the update action
 * - Fetches the existing resource by ID
 * - Validates resource ownership if enabled
 * - Updates the resource with request data
 * - Strips protected properties before returning
 * 
 * Used by ResourceController to handle PUT/PATCH requests to update resources.
 * Provides standardized update functionality while enforcing security rules
 * and data protection.
 */
export class ResourceUpdateService extends AbastractBaseResourceService {

    routeResourceType: string = RouteResourceTypes.UPDATE

    /**
     * Handles the resource delete action
     * - Validates that the request is authorized
     * - Checks if the resource owner security applies to this route and it is valid
     * - Deletes the resource
     * - Sends the results back to the client
     * @param {BaseRequest} req - The request object
     * @param {Response} res - The response object
     * @param {IRouteResourceOptionsLegacy} options - The options object
     * @returns {Promise<void>}
     */
    async handler(context: HttpContext): Promise<ApiResponse<IModelAttributes | TResponseErrorMessages>> {

        // Check if the authorization security applies to this route and it is valid
        if (!await this.validateAuthorizedOrAccessAsGuest(context)) {
            throw new UnauthorizedException()
        }

        const routeOptions = context.getRouteItem()

        if (!routeOptions) {
            throw new ResourceException('Route options are required')
        }

        // Validate the request body
        const validationErrors = await this.getValidationErrors(context)

        if (validationErrors) {
            return this.apiResponse(context, {
                errors: validationErrors
            }, 422)
        }

        // const modelConstructor = this.getModelConstructor(context)
        const resourceRepository = context.resourceContext.repository;
        let resourceData = await resourceRepository.getResource(context.getRequest().params?.id) as IResourceData

        if (!resourceData) {
            throw new ResourceNotFoundException('Resource not found')
        }

        // Check if the resource owner security applies to this route and it is valid
        if (!await this.validateResourceAccess(context, resourceData)) {
            throw new ForbiddenResourceError()
        }

        resourceData = {
            ...resourceData,
            ...context.getRequest().body
        }

        await resourceRepository.updateResource(resourceData)
        const strippedResourceData = await resourceRepository.stripSensitiveData(resourceData)

        // Send the results
        return this.apiResponse<IModelAttributes>(context, strippedResourceData, 200)
    }
}

export default ResourceUpdateService;