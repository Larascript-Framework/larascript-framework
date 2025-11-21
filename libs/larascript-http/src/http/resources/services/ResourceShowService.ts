import HttpContext from "@/http/context/HttpContext.js";
import ResourceException from "@/http/exceptions/ResourceException.js";
import { ResourceNotFoundException } from "@/http/exceptions/ResourceNotFoundException.js";
import { UnauthorizedException } from "@/http/exceptions/UnauthorizedException.js";
import ApiResponse from "@/http/response/ApiResponse.js";
import { IModelAttributes } from "@larascript-framework/contracts/database/model";
import { RouteResourceTypes } from "@larascript-framework/contracts/http";
import { ForbiddenResourceError } from "../../exceptions/ForbiddenResourceError.js";
import AbastractBaseResourceService from "../abstract/AbastractBaseResourceService.js";

/**
 * Service class that handles retrieving individual resources through HTTP requests
 * 
 * This service:
 * - Validates authorization for viewing the resource
 * - Fetches a single resource by ID
 * - Validates resource ownership if enabled
 * - Strips protected properties before returning
 * 
 * Used by ResourceController to handle GET requests for individual resources.
 * Provides standardized show/view functionality while enforcing security rules
 * and data protection.
 */

export class ResourceShowService extends AbastractBaseResourceService {

    routeResourceType: string = RouteResourceTypes.SHOW

    /**
     * Handles the resource show action
     * - Validates that the request is authorized
     * - If the resource owner security is enabled, adds the owner's id to the filters
     * - Fetches the result using the filters
     * - Maps the result to a model
     * - Strips the guarded properties from the result
     * - Sends the result back to the client
     * @param req The request object
     * @param res The response object
     * @param options The resource options
     */
    async handler(context: HttpContext): Promise<ApiResponse<IModelAttributes>> {

        if (!await this.validateAuthorizedOrAccessAsGuest(context)) {
            throw new UnauthorizedException()
        }

        const routeOptions = context.getRouteItem()

        if (!routeOptions) {
            throw new ResourceException('Route options are required')
        }

        const id = context.getRequest().params?.id

        if (!this.validateId(id)) {
            return this.apiResponse<IModelAttributes>(context, {
                message: 'Resource not found'
            }, 404)
        }

        const repository = context.resourceContext.repository
        const resourceData = await repository.getResource(id)

        if (!resourceData) {
            throw new ResourceNotFoundException('Resource not found')
        }

        // Check if the resource owner security applies to this route and it is valid
        if (!await this.validateResourceAccess(context, resourceData)) {
            throw new ForbiddenResourceError()
        }

        const strippedResourceData = await repository.stripSensitiveData(resourceData)

        // Send the results
        return this.apiResponse<IModelAttributes>(context, strippedResourceData, 200)
    }

    /**
     * Validates the id
     * @param id The id to validate
     * @returns True if the id is valid, false otherwise
     */
    protected validateId(id: string): boolean {
        return typeof id === 'string' && id !== 'null';
    }

}

export default ResourceShowService;