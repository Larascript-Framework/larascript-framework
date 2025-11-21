import HttpContext from "@/http/context/HttpContext.js";
import ResourceException from "@/http/exceptions/ResourceException.js";
import { ResourceNotFoundException } from "@/http/exceptions/ResourceNotFoundException.js";
import { UnauthorizedException } from "@/http/exceptions/UnauthorizedException.js";
import ApiResponse from "@/http/response/ApiResponse.js";
import { IResourceData, RouteResourceTypes } from "@larascript-framework/contracts/http";
import { ForbiddenResourceError } from "../../exceptions/ForbiddenResourceError.js";
import AbastractBaseResourceService from "../abstract/AbastractBaseResourceService.js";

/**
 * Service class that handles deleting resources through HTTP requests
 * 
 * This service:
 * - Validates authorization for deleting the resource
 * - Fetches the resource by ID
 * - Validates resource ownership if enabled
 * - Deletes the resource
 * - Returns success response
 * 
 * Used by ResourceController to handle DELETE requests for resources.
 * Provides standardized delete functionality while enforcing security rules
 * and ownership validation.
 *
 * Key features:
 * - Authorization checks before deletion
 * - Resource ownership validation
 * - Secure deletion of resources
 * - Standardized success response
 */
export class ResourceDeleteService extends AbastractBaseResourceService {

    routeResourceType: string = RouteResourceTypes.DELETE

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
    async handler(context: HttpContext): Promise<ApiResponse> {


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

        const repository = context.resourceContext.repository;
        const resourceData = await repository.getResource(context.getRequest().params?.id) as IResourceData

        if (!resourceData) {
            throw new ResourceNotFoundException('Resource not found')
        }

        // Check if the resource owner security applies to this route and it is valid
        if (!await this.validateResourceAccess(context, resourceData)) {
            throw new ForbiddenResourceError()
        }

        // Delete the resource item
        await repository.deleteResource(resourceData)

        // Send the results
        return this.apiResponse(context, {}, 200)
    }

}

export default ResourceDeleteService;