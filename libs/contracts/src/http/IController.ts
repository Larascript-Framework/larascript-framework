/* eslint-disable no-unused-vars */

import { IHttpContext } from "./IHttpContext.js"
import { TRouteItem } from "./IRouter.js"

export interface ControllerConstructor {
    new (context: IHttpContext): IController
    executeAction(action: string, context: IHttpContext): Promise<void>
}

export interface IController {
    setContext(context: IHttpContext): void
    getRouteOptions(): TRouteItem | undefined
}