import { IHttpContext, IResourceRepository, TDataSourceRepository, TRouteResourceOptions } from "@larascript-framework/contracts/http";
import RouteConfigException from "../exceptions/RouteConfigException.js";

export class ResourceContext {

    constructor(private readonly context: IHttpContext) {}

    /**
     * Gets the options of the resource.
     * @returns {TRouteResourceOptions} The options of the resource.
     */
    get options(): TRouteResourceOptions {
        if(!this.context.getRouteItem()) {
            throw new RouteConfigException('Route item is not set')
        }

        if(!this.context.getRouteItem()?.resource) {
            throw new RouteConfigException('Resource is not set')
        }

        return this.context.getRouteItem()?.resource!
    }

    /**
     * Gets the searching option of the resource.
     * @returns {TRouteResourceOptions['searching']} The searching option of the resource.
     */
    get searching(): TRouteResourceOptions['searching'] {
        return this.options.searching ?? {}
    }

    /**
     * Gets the fuzzy option of the resource.
     * @returns {boolean} The fuzzy option of the resource.
     */
    get fuzzy(): boolean {
        return this.options.searching?.fuzzy ?? false
    }

    /**
     * Gets the repository of the resource.
     * @returns {IResourceRepository} The repository of the resource.
     */
    get repository(): IResourceRepository {
        const repository = (this.context.getRouteItem()?.resource?.datasource as TDataSourceRepository).repository

        if(!repository) {
            throw new RouteConfigException('Repository is not set')
        }

        return repository
    }
}