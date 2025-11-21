import Controller from "@/http/base/Controller.js";
import responseError from "@/http/handlers/responseError.js";
import { IHttpContext } from "@larascript-framework/contracts/http";
import AbastractBaseResourceService from "../abstract/AbastractBaseResourceService.js";
import ResourceCreateService from "../services/ResourceCreateService.js";
import ResourceDeleteService from "../services/ResourceDeleteService.js";
import ResourceIndexService from "../services/ResourceIndexService.js";
import ResourceShowService from "../services/ResourceShowService.js";
import ResourceUpdateService from "../services/ResourceUpdateService.js";

/**
 * ResourceController handles CRUD operations for resources (database models)


 * 
 * This controller provides standardized endpoints for:
 * - Listing resources (index) with pagination and filtering
 * - Showing individual resources (show) 
 * - Creating new resources (create)
 * - Updating existing resources (update)
 * - Deleting resources (delete)
 *
 * It works with any model that implements the required interfaces and uses services
 * to handle the business logic for each operation. The controller:
 * 
 * - Delegates operations to specialized services (ResourceIndexService, ResourceCreateService etc)
 * - Handles authorization checks through the services
 * - Manages resource ownership validation where configured
 * - Strips protected properties before returning responses
 * - Provides consistent error handling
 *
 * Used by defining routes with Route.resource() and specifying the model, middleware and security rules
 */
export class ResourceController  extends Controller {

    protected indexService = new ResourceIndexService();
    
    protected createService = new ResourceCreateService();

    protected showService = new ResourceShowService();

    protected updateService = new ResourceUpdateService();

    protected deleteService = new ResourceDeleteService();

    /**
     * @description Get all resources
     * @returns {Promise<void>}
     */
    public async index(): Promise<void> {
        await this.handler(this.context, this.indexService)
    }

    /**
     * @description Get a resource by id
     * @returns {Promise<void>}
     */
    public async show(): Promise<void> {
        await this.handler(this.context, this.showService)
    }

    /**
     * @description Create a resource
     * @returns {Promise<void>}
     */
    public async create(): Promise<void> {
        await this.handler(this.context, this.createService)

    }

    /**
     * @description Update a resource
     * @returns {Promise<void>}
     */
    public async update(): Promise<void> {
        await this.handler(this.context, this.updateService)

    }

    /**
     * @description Delete a resource
     * @returns {Promise<void>}
     */
    public async delete(): Promise<void> {
        await this.handler(this.context, this.deleteService)

    }

    /**
     * @description Handles the service
     * @param {HttpContext} context - The context
     * @param {AbastractBaseResourceService} service - The service
     * @returns {Promise<void>}
     */
    protected async handler(context: IHttpContext, service: AbastractBaseResourceService) {
        try {
            const apiResponse = await service.handler(context)
            this.jsonResponse(apiResponse.build(), apiResponse.getCode())
        }

        catch(error) {
            responseError(context.getRequest(), context.getResponse(), error as Error)
        }
    }

}

export default ResourceController;