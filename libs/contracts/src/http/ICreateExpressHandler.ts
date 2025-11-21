import { TRouteItem } from "./index.js";

export interface ICreateExpressHandler<T = unknown> {
    // eslint-disable-next-line no-unused-vars
    toExpressHandler(routeItem?: TRouteItem): T
}