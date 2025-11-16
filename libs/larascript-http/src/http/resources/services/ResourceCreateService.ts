import HttpContext from "@/http/context/HttpContext.js";
import ResourceException from "@/http/exceptions/ResourceException.js";
import { UnauthorizedException } from "@/http/exceptions/UnauthorizedException.js";
import ApiResponse from "@/http/response/ApiResponse.js";
import { IModelAttributes } from "@larascript-framework/contracts/database/model";
import { RouteResourceTypes, TResponseErrorMessages } from "@larascript-framework/contracts/http";
import { ForbiddenResourceError } from "../../exceptions/ForbiddenResourceError.js";
import AbastractBaseResourceService from "../abstract/AbastractBaseResourceService.js";

/**
 * Service class that handles creating new resources through HTTP requests

 * 
 * This service:
 * - Validates authorization for creating resources
 * - Creates a new model instance with request data
 * - Sets resource ownership if enabled
 * - Saves the new resource
 * - Strips protected properties before returning
 * 
 * Used by ResourceController to handle POST requests for creating resources.
 * Provides standardized create functionality while enforcing security rules
 * and data protection.
 *
 * Key features:
 * - Authorization validation
 * - Resource ownership assignment
 * - Protected property stripping
 * - Standardized resource creation
 */

export class ResourceCreateService extends AbastractBaseResourceService {

    routeResourceType: string = RouteResourceTypes.CREATE

    /**
     * Handles the resource create action
     * - Validates that the request is authorized
     * - If the resource owner security is enabled, adds the owner's id to the model properties
     * - Creates a new model instance with the request body
     * - Saves the model instance
     * - Strips the guarded properties from the model instance
     * - Sends the model instance back to the client
     * @param req The request object
     * @param res The response object
     * @param options The resource options
     */
    async handler(context: HttpContext): Promise<ApiResponse<IModelAttributes | TResponseErrorMessages>> {

        if (!await this.validateAuthorizedOrAccessAsGuest(context)) {
            throw new UnauthorizedException()
        }

        const req = context.getRequest()
        const routeOptions = context.getRouteItem()

        if (!routeOptions) {
            throw new ResourceException('Route options are required')
        }

        // Build the page options, filters
        const repository = context.resourceContext.repository
        let resourceData = await repository.createResourceWithoutSaving(req.body)

        // Check if the resource owner security applies to this route and it is valid
        // If it is valid, we add the owner's id to the filters
        if (await this.validateResourceOwnerApplicable(context)) {

            const user = await this.getUser()

            if (!user) {
                throw new ForbiddenResourceError()
            }

            resourceData[repository.getResourceOwnerAttribute()] = user.getId()
        }

        // Validate the request body
        const validationErrors = await this.getValidationErrors(context)

        if (validationErrors) {
            return this.apiResponse(context, {
                errors: validationErrors
            }, 422)
        }

        // Fill the model instance with the request body
        resourceData = {
            ...resourceData,
            ...req.body
        }
        resourceData = await repository.createResource(resourceData);

        // Strip the guarded properties from the model instance
        const attributes = await repository.stripSensitiveData(resourceData)

        // Send the results
        return this.apiResponse(context, attributes, 201)
    }

}

export default ResourceCreateService