import { IRouteGroupOptions, IRouter, TExpressMiddlewareFnOrClass, TPartialRouteItemOptions, TResourceType, TRouteGroupFn, TRouteItem, TRouteResourceOptions, TRouterMethodOptions } from "@larascript-framework/contracts/http";
import SecurityRules from "../security/services/SecurityRules.js";
import ResourceRouter from "./RouterResource.js";

/**
 * Router handles registration and organization of Express routes
 * 
 * This class provides a fluent interface for defining routes with:
 * - HTTP method registration (GET, POST, PUT, etc)
 * - Route grouping with shared prefixes and middleware
 * - Resource routing for RESTful CRUD operations
 * - Route naming and organization
 * - Security rule application
 * 
 * Example usage:
 * ```
 * const router = new Router();
 * 
 * router.group({
 *   prefix: '/api',
 *   middlewares: [AuthMiddleware]
 * }, (router) => {
 *   router.get('/users', 'index');
 *   router.post('/users', 'create');
 * });
 * 
 * router.resource({
 *   prefix: '/blogs',
 *   resource: BlogModel,
 *   security: [SecurityRules.resourceOwner()]
 * });
 * ```
 * 
 * The router:
 * - Maintains a registry of all registered routes
 * - Handles route group nesting and inheritance
 * - Delegates resource routing to ResourceRouter
 * - Applies middleware and security rules
 * - Manages route prefixing and naming
 */
export class HttpRouter implements IRouter {

    /**
     * The route group options.
     */
    baseOptions: IRouteGroupOptions | null = null;

    previousBaseOptions: IRouteGroupOptions | null = null;

    /**
     * The registered routes.
     */
    registered: TRouteItem[] = [];

    /**
     * Get the registered routes.
     */
    public getRegisteredRoutes(): TRouteItem[] {
        return this.registered;
    }

    /**
     * Set the registered routes.
     */
    public setRegisteredRoutes(routes: TRouteItem[]): void {
        this.registered = routes;
    }

    /**
     * Checks if any routes has been added to this router
     * @returns 
     */
    public empty(): boolean {
        return this.getRegisteredRoutes().length === 0
    }

    /**
     * Register a GET route.
     */
    public get(path: TRouteItem['path'], action: TRouteItem['action'], options: TRouterMethodOptions = {}): void {
        this.register({ path, method: 'GET', action, ...options });
    }
    
    /**
         * Register a POST route.
         */
    public post(path: TRouteItem['path'], action: TRouteItem['action'], options: TRouterMethodOptions = {}): void {
        this.register({ path, method: 'POST', action, ...options });
    }
    
    /**
     * Register a PUT route.
     */
    public put(path: TRouteItem['path'], action: TRouteItem['action'], options: TRouterMethodOptions = {}): void {
        this.register({ path, method: 'PUT', action, ...options });
    }
    
    /**
     * Register a PATCH route.
     */
    public patch(path: TRouteItem['path'], action: TRouteItem['action'], options: TRouterMethodOptions = {}): void {
        this.register({ path, method: 'PATCH', action, ...options });
    }
    
    /**
     * Register a DELETE route.
     */
    public delete(path: TRouteItem['path'], action: TRouteItem['action'], options: TRouterMethodOptions = {}): void {
        this.register({ path, method: 'DELETE', action, ...options });
    }

    /**
     * Register a resource route.
     */
    public resource(options: TRouteResourceOptions): IRouter {
        const router = ResourceRouter.resource(options, new HttpRouter());

        router.getRegisteredRoutes().map(route => {
            this.register(route)
        })

        return this
    }

    /**
     * Get the security rules.
     */
    public security(): typeof SecurityRules {
        return SecurityRules;
    }
       
    /**
     * Create a new group of routes.
     * 
     * The flow of this method:
     * 1. Saves current options to restore them later
     * 2. If first arg is a function, executes it directly with current router
     * 3. Otherwise, merges new options with existing ones (prefixes, names, etc)
     * 4. Executes the router function if provided to add routes with merged options
     * 5. Restores previous options so routes added after group() use original options
     * 
     */
    public group(options: IRouteGroupOptions | TRouteGroupFn, routerFn?: TRouteGroupFn): IRouter {

        // Save the current options
        this.previousBaseOptions = {...this.baseOptions};
        
        // If the first argument is a function, it is a router function
        if (typeof options === 'function') {
            routerFn = options as TRouteGroupFn;
            options = {} as IRouteGroupOptions;
        }

        // Apply the options - this will combine options from parent groups
        // For example, if parent group has prefix '/api' and child group has prefix '/users'
        // The resulting prefix will be '/api/users'
        // Similarly, if parent group has name 'api.' and child group has name 'users'
        // The resulting name will be 'api.users'
        this.applyOptions(this, options);

        // If there is a router function, apply it
        if (routerFn) {
            routerFn(this);
        }

        // Reset to the previous options
        this.resetOptions();

        return this;
    }

    /**
     * Reset the options to the previous state.
     */
    protected resetOptions(): void {
        this.baseOptions = {...(this.previousBaseOptions ?? {})};
    }

    /**
     * Apply the options to the route.
     */
    public applyOptions(route: IRouter, options: IRouteGroupOptions): void {
        const newOptions = {...this.baseOptions, ...options};
        const newSecurity = [...(this.baseOptions?.security ?? []), ...(options?.security ?? [])];

        newOptions.name = this.concat(this.baseOptions?.name, options?.name);
        newOptions.prefix = this.concat(this.baseOptions?.prefix, options?.prefix);
        newOptions.security = newSecurity;
        this.applyOptionsMiddleware(route, newOptions);
        this.baseOptions = {...newOptions};

    }

    /**
     * Apply the middleware options to the route.
     */
    public applyOptionsMiddleware(route: IRouter, options: IRouteGroupOptions): void {
        const currentMiddlewareOrDefault = this.baseOptions?.middlewares ?? [] as TExpressMiddlewareFnOrClass[];
        const currentMiddleware = (Array.isArray(currentMiddlewareOrDefault) ? currentMiddlewareOrDefault : [currentMiddlewareOrDefault]) as TExpressMiddlewareFnOrClass[];
        
        const optionsMiddlewareOrDefault = options?.middlewares ?? [] as TExpressMiddlewareFnOrClass[];
        const optionsMiddleware = (Array.isArray(optionsMiddlewareOrDefault) ? optionsMiddlewareOrDefault : [optionsMiddlewareOrDefault]) as TExpressMiddlewareFnOrClass[];

        options.middlewares = [...currentMiddleware, ...optionsMiddleware] as TExpressMiddlewareFnOrClass[];

        // Remove middleware duplicates
        options.middlewares = options.middlewares.filter((middleware, index, self) => {
            return self.indexOf(middleware) === index;
        });
    }

    /**
     * Concatenate two strings with a delimiter.
     */
    protected concat(value1?: string, value2?: string, delimiter: string = ''): string {
        value1 = value1 ?? '';
        value2 = value2 ?? '';
        return `${value1}${delimiter}${value2}`;
    }

    /**
     * Register a route.
     */
    public register({ path, method, action, ...options }: Partial<TRouteItem> & TPartialRouteItemOptions): void {
        const optionsMiddlewareArray = this.getRouteItemMiddlewareArray(options);
        const currentMiddlewareArray = this.getBaseMiddlewareArray();

        const routeItem = {
            ...this.baseOptions,
            path: this.getPath(path ?? ''),
            method: method ?? 'GET',
            action: action ?? '',
            ...options,
            // Combine security rules from parent and child groups
            security: [...(this.baseOptions?.security ?? []), ...(options?.security ?? [])],
            middlewares: [...currentMiddlewareArray, ...optionsMiddlewareArray],
            resource: {
                type: options?.resource?.type ?? 'index',
                ...options?.resource,
            } as { type: TResourceType } & TRouteResourceOptions,
        }

        this.registered.push(routeItem);
    }

    /**
     * Get the middleware array for the route item.
     */
    private getRouteItemMiddlewareArray(options: TPartialRouteItemOptions): TExpressMiddlewareFnOrClass[] {
        const optionsMiddleware = options?.middlewares ?? [] as TExpressMiddlewareFnOrClass[];
        const optionsMiddlewareArray = Array.isArray(optionsMiddleware) ? optionsMiddleware : [optionsMiddleware];
        return optionsMiddlewareArray;
    }

    /**
     * Get the middleware array for the base options.
     */
    private getBaseMiddlewareArray() {
        const currentMiddleware = (() => {
            const baseOptionsMiddleware = this.baseOptions?.middlewares ?? [] as TExpressMiddlewareFnOrClass[];
            return (Array.isArray(baseOptionsMiddleware) ? baseOptionsMiddleware : [baseOptionsMiddleware]) as TExpressMiddlewareFnOrClass[];
        })();
        const currentMiddlewareArray = Array.isArray(currentMiddleware) ? currentMiddleware : [currentMiddleware];
        return currentMiddlewareArray;
    }

    /**
     * Get the prefix without the prefix forward slash.
     */
    protected getPrefix(prefix: string): string {
        const prefixWithoutPrefixForwardSlash = prefix.startsWith('/') ? prefix.slice(1) : prefix;
        return prefixWithoutPrefixForwardSlash;
    }

    /**
     * Get the path with the prefix and formatted parameters.
     */
    protected getPath(path: string): string {
        // Remove suffix forward slash if it ends with a forward slash
        const prefixString = this.baseOptions?.prefix ?? '';
        const prefixWithoutSuffixForwardSlash = prefixString.endsWith('/') ? prefixString.slice(0, -1) : prefixString;
        // Add prefix if it doesn't start with a forward slash
        const pathWithPrefixForwardSlash = path.startsWith('/') ? path : `/${path}`;
        // Remove suffix forward slash if it ends with a forward slash
        const pathWitoutSuffixForwardSlash = pathWithPrefixForwardSlash.endsWith('/') ? pathWithPrefixForwardSlash.slice(0, -1) : pathWithPrefixForwardSlash;
        // Combine prefix and path
        const combinedPath = this.concat(prefixWithoutSuffixForwardSlash, pathWitoutSuffixForwardSlash);
        // Format path parameters to express format (e.g. /{id} -> /:id)
        const formattedPath = combinedPath.replace(/\{(\w+)\}/g, ':$1');

        return formattedPath;
    }

}

export default HttpRouter