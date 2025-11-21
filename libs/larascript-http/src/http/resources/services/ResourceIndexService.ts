import HttpContext from "@/http/context/HttpContext.js";
import ResourceException from "@/http/exceptions/ResourceException.js";
import { UnauthorizedException } from "@/http/exceptions/UnauthorizedException.js";
import ApiResponse from "@/http/response/ApiResponse.js";
import Paginate from "@/http/utils/Paginate.js";
import QueryFilters from "@/http/utils/QueryFilters.js";
import SortOptions from "@/http/utils/SortOptions.js";
import { IModelAttributes } from "@larascript-framework/contracts/database/model";
import { IPageOptions, ISortOption, RouteResourceTypes, TRouteItem } from "@larascript-framework/contracts/http";
import AbastractBaseResourceService from "../abstract/AbastractBaseResourceService.js";

/**
 * Service class that handles retrieving collections of resources through HTTP requests
 * 
 * This service:
 * - Validates authorization for viewing the resource collection
 * - Applies pagination and filtering options from the request
 * - Fetches filtered and paginated results
 * - Strips protected properties before returning
 * 
 * Used by ResourceController to handle GET requests for resource collections.
 * Provides standardized index/list functionality while enforcing security rules
 * and data protection.
 *
 * Key features:
 * - Pagination support via pageSize and skip parameters
 * - Filtering via query parameters
 * - Authorization checks
 * - Protected property stripping
 */

export class ResourceIndexService extends AbastractBaseResourceService {

    routeResourceType: string = RouteResourceTypes.INDEX

    /**
     * Handles the resource all action
     * - Validates that the request is authorized
     * - If the resource owner security is enabled, adds the owner's id to the filters
     * - Fetches the results using the filters and page options
     * - Maps the results to models
     * - Strips the guarded properties from the results
     * - Sends the results back to the client
     * @param req The request object
     * @param res The response object
     * @param options The resource options
     */
    async handler(context: HttpContext): Promise<ApiResponse<IModelAttributes[]>> {

        if (!await this.validateAuthorizedOrAccessAsGuest(context)) {
            throw new UnauthorizedException()
        }

        // Get the route options
        const routeOptions = context.getRouteItem()

        if (!routeOptions) {
            throw new ResourceException('Route options are required')
        }

        const repository = context.resourceContext.repository;
        const totalCount = await repository.getResourcesCount();

        // Build the page options, filters and sort options
        const paginate = this.buildPageOptions(context, totalCount);
        const filters = this.buildQueryFilters(context);
        const sortOptions = this.buildSortOptions(context);

        // Check if the resource owner security applies to this route and it is valid
        // If it is valid, we add the owner's id to the filters
        if (await this.validateResourceOwnerApplicable(context)) {
            const userId = context.getUserOrFail().getId()
            filters[repository.getResourceOwnerAttribute()] = userId
        }

        // Fetch the results
        let resultDataArray = await repository.getResourcesPage(filters, paginate.getPage(), paginate.getPageSize() ?? 10, sortOptions);

        // Strip the sensitive data
        resultDataArray = await Promise.all(resultDataArray.map(resultData => repository.stripSensitiveData(resultData)))

        // Send the results
        return this.apiResponse<IModelAttributes[]>(context, resultDataArray, 200, {
            showPagination: true,
            paginate
        })
    }

    /**
     * Builds the filters object by combining base filters defined in route options with
     * request filters from the query string. 
     * 
     * The base filters are defined in the route's
     * resource.filters.index configuration, while request filters come from the 'filters'
     * query parameter. 
     * 
     * The combined filters are processed to add SQL LIKE wildcards and
     * stripped of any fields that don't exist on the resource model.
     * 
     * @param {BaseRequest} req - The request object
     * @param {TRouteItem} options - The options object
     * @returns {object} - The filters object
     */
    buildQueryFilters(context: HttpContext): object {
        const req = context.getRequest()
        const routeItem = context.getRouteItem() as TRouteItem

        const baseFilters = routeItem?.resource?.filters ?? {};
        const allowedFields = routeItem?.resource?.searching?.fields ?? []

        const options = {
            baseFilters: baseFilters,
            allowedFields: allowedFields,
            fuzzy: context.resourceContext.fuzzy,
        }

        return QueryFilters.parseRequest(req, options).filters
    }

    /**
     * Builds the page options
     * 
     * @param {BaseRequest} req - The request object
     * @param {IRouteResourceOptionsLegacy} options - The options object
     * @returns {IPageOptions} - An object containing the page number, page size, and skip
     */
    buildPageOptions(context: HttpContext, totalCount: number): Paginate {
        const req = context.getRequest()
        const options = context.getRouteItem() as TRouteItem

        const paginateOptions = {
            totalCount: totalCount,
            ...options.resource?.paginate
        }

        return Paginate.parseRequest(req, paginateOptions);
    }

    /**
     * Builds the sort options
     * 
     * @param {BaseRequest} req - The request object
     * @returns {ISortOption[]} - The sort options
     */
    buildSortOptions(context: HttpContext): ISortOption[] {
        const sortOptions = SortOptions.parseRequest(
            context.getRequest(),
            context.resourceContext.options.sorting
        );
        const results = sortOptions.results;

        return Object.entries(results).map(([field, direction]) => ({
            field: field,
            sortDirection: direction
        }));
    }

}

export default ResourceIndexService;