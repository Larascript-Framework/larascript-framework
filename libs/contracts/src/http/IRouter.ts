/* eslint-disable no-unused-vars */
import { CustomValidatorConstructor } from "../validator/index.js";
import { ControllerConstructor } from "./IController.js";
import { TDataSource } from "./IDataSource.js";
import { TExpressMiddlewareFnOrClass } from "./IMiddleware.js";
import { ISecurityRule, ISecurityRules } from "./ISecurity.js";
import { TSortDefaults } from "./ISorting.js";

export type RouteConstructor = {
    new (...args: any[]): IRouter;
    group(options: IRouteGroupOptions | TRouteGroupFn, routesFn?: TRouteGroupFn): IRouter;
}

export interface IRouteGroupOptions {
    prefix?: string;
    name?: string;
    middlewares?: TExpressMiddlewareFnOrClass | TExpressMiddlewareFnOrClass[];
    controller?: ControllerConstructor;
    security?: ISecurityRule[]
    config?: Record<string, unknown>;
}


export type TRouteGroupFn = (routes: IRouter) => void;

export type TPartialRouteItemOptions = Omit<TRouteItem, 'path' | 'method' | 'action'>;

export interface IRouter {

    baseOptions: IRouteGroupOptions | null;

    getRegisteredRoutes(): TRouteItem[];

    setRegisteredRoutes(routes: TRouteItem[]): void;

    empty(): boolean;

    get(path: TRouteItem['path'], action: TRouteItem['action'], options?: TPartialRouteItemOptions): void;

    post(path: TRouteItem['path'], action: TRouteItem['action'], options?: TPartialRouteItemOptions): void;

    put(path: TRouteItem['path'], action: TRouteItem['action'], options?: TPartialRouteItemOptions): void;

    patch(path: TRouteItem['path'], action: TRouteItem['action'], options?: TPartialRouteItemOptions): void;

    delete(path: TRouteItem['path'], action: TRouteItem['action'], options?: TPartialRouteItemOptions): void;

    group(options: IRouteGroupOptions | TRouteGroupFn, routesFn?: TRouteGroupFn): IRouter;

    resource(options: TRouteResourceOptions): IRouter;

    security(): ISecurityRules;
}

export interface IRoute {
    group(routesFn?: TRouteGroupFn): IRouter;
    group(options: IRouteGroupOptions | TRouteGroupFn, routesFn?: TRouteGroupFn): IRouter;
}

export type TResourceType = 'index' | 'show' | 'create' | 'update' | 'delete';

export type TRouterMethodOptions = Omit<TRouteItem, 'path' | 'method' | 'action' | 'resource'>;

export type TAllowUnauthenticated = boolean | {
    [key in TResourceType]?: boolean;
}

export type TRouteItem = {
    path: string;
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS';
    action: string | TExpressMiddlewareFnOrClass | ControllerConstructor | [ControllerConstructor, string];
    name?: string;
    prefix?: string;
    middlewares?: TExpressMiddlewareFnOrClass | TExpressMiddlewareFnOrClass[];
    controller?: ControllerConstructor;
    security?: ISecurityRule[];
    config?: Record<string, unknown>;
    validator?: CustomValidatorConstructor | CustomValidatorConstructor[];
    resource?: {
        type: TResourceType
    } & TRouteResourceOptions
}

export type TRouteResourceOptions = {
    prefix: string;
    security?: ISecurityRule[];
    middlewares?: TExpressMiddlewareFnOrClass | TExpressMiddlewareFnOrClass[];
    datasource?: TDataSource;
    scopes?: {
        index?: string[];
        show?: string[];
        create?: string[];
        update?: string[];
        delete?: string[];
    }
    filters?: object;
    validator?: CustomValidatorConstructor;
    validateBeforeAction?: boolean;
    searching?: {
        fields?: string[];
        fuzzy?: boolean;
    }
    paginate?: {
        pageSize: number;
        allowPageSizeOverride?: boolean;
    }
    sorting?: TSortDefaults;
    validation?: {
        create?: CustomValidatorConstructor;
        update?: CustomValidatorConstructor;
        delete?: CustomValidatorConstructor;
    },
    only?: TResourceType[];
    allowUnauthenticated?: TAllowUnauthenticated;
}
