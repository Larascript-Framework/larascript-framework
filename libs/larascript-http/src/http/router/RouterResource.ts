import { IRouter, ISecurityRule, RouteResourceTypes, TPartialRouteItemOptions, TResourceType, TRouteResourceOptions } from "@larascript-framework/contracts/http"
import { DataSourceResolver } from "../resolver/DataSourceResolver.js"
import ResourceController from "../resources/controller/ResourceController.js"
import SecurityRules from "../security/services/SecurityRules.js"


/**
 * ResourceRouter provides a standardized way to create RESTful resource routes
 * 
 * It automatically generates the following routes for a given resource:
 * - GET / - Index route to list resources
 * - GET /:id - Show route to get a single resource
 * - POST / - Create route to add a new resource
 * - PUT /:id - Update route to modify an existing resource
 * - DELETE /:id - Delete route to remove a resource
 * 
 * Usage:
 * ```
 * routes.resource({
 *   prefix: '/blogs',
 *   resource: BlogModel,
 *   middlewares: [AuthMiddleware],
 *   security: [SecurityRules.resourceOwner('user_id')],
 *   filters: {
 *       index: {
 *           active: true
 *       },
 *       show: {
 *           active: true
 *       }
 *   }

 * })
 * ```
 * 
 * The router:
 * - Maps routes to ResourceController methods
 * - Applies provided middleware and security rules
 * - Sets up proper route parameters
 * - Handles resource type tracking for security validation
 * - Maintains consistent RESTful routing patterns
 */

export class ResourceRouter {

    /**
     * Add resource routes to the router.
     */
    public static resource({ ...resource }: TRouteResourceOptions, router: IRouter): IRouter {

        const routeItemOptions: TPartialRouteItemOptions = {
            resource: {
                ...resource,
            } as { type: TResourceType } & TRouteResourceOptions,
        }

        const registerIndex = this.shouldRegisterType(RouteResourceTypes.INDEX, resource.only)
        const registerShow = this.shouldRegisterType(RouteResourceTypes.SHOW, resource.only)
        const registerCreate = this.shouldRegisterType(RouteResourceTypes.CREATE, resource.only)
        const registerUpdate = this.shouldRegisterType(RouteResourceTypes.UPDATE, resource.only)
        const registerDelete = this.shouldRegisterType(RouteResourceTypes.DELETE, resource.only)

        // Resolve the datasource as a repository
        const datasourceRepository = DataSourceResolver.resolveDatasourceAsRepository(resource)
        resource = {
            ...resource,
            datasource: datasourceRepository,
        }

        router.group({
            ...resource,
            prefix: resource.prefix,
            controller: ResourceController,
        }, (router) => {
            
            if(registerIndex) {
                router.get('/', 'index', {
                    ...routeItemOptions,
                    resource: {
                        type: RouteResourceTypes.INDEX,
                        ...resource,
                    },
                    security: this.mergeScopesSecurityRules(RouteResourceTypes.INDEX, resource.scopes, resource.security ?? [])
                });
            }

            if(registerShow) {
                router.get('/:id', 'show', {
                    ...routeItemOptions,
                    resource: {
                        type: RouteResourceTypes.SHOW,
                        ...resource,
                    },
                    security: this.mergeScopesSecurityRules(RouteResourceTypes.SHOW, resource.scopes, resource.security ?? [])
                });
            }

            if(registerCreate) {
                router.post('/', 'create', {
                    ...routeItemOptions,
                    resource: {
                        ...resource,
                        type: RouteResourceTypes.CREATE,
                    },
                    security: this.mergeScopesSecurityRules(RouteResourceTypes.CREATE, resource.scopes, resource.security ?? [])
                });
            }

            if(registerUpdate) {
                router.put('/:id', 'update', {
                    ...routeItemOptions,
                    resource: {
                        ...resource,
                        type: RouteResourceTypes.UPDATE,
                    },
                    security: this.mergeScopesSecurityRules(RouteResourceTypes.UPDATE, resource.scopes, resource.security ?? [])
                });
            }

            if(registerDelete) {
                router.delete('/:id', 'delete', {
                    ...routeItemOptions,
                    resource: {
                        ...resource,
                        type: RouteResourceTypes.DELETE,
                    },
                    security: this.mergeScopesSecurityRules(RouteResourceTypes.DELETE, resource.scopes, resource.security ?? [])
                });
            }
        })


        return router;
    }

    /**
     * Merge the scopes security rules for a resource type.
     */
    private static mergeScopesSecurityRules(type: TResourceType, scopes: TRouteResourceOptions['scopes'], securityRules: ISecurityRule[] = []) {
        if(scopes?.[type]) {
            return [...securityRules, SecurityRules.scopes(scopes[type])]
        }
        return securityRules
    }

    /**
     * Determines if a resource type should be registered based on the provided options.
     * 
     * @param type - The resource type to check
     * @param only - An optional array of resource types to check against
     * @returns true if the type should be registered, false otherwise
     */
    protected static shouldRegisterType (type: TResourceType, only?: TResourceType[]) {
        if(!only) {
            return true
        }
        return only.includes(type)
    }

}

export default ResourceRouter