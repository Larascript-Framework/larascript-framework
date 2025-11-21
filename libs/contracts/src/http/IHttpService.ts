/* eslint-disable no-unused-vars */
import express from "express";
import http from "http";
import IExpressConfig from "./IHttpConfig.js";
import { IRoute, IRouter, TRouteItem } from "./IRouter.js";

export interface IHttpService {
    init(): void;
    boot(): Promise<void>;
    useRouterAndApply(route: IRouter): void;
    useRouter(route: IRouter): void;
    getExpress(): express.Express;
    listen(): Promise<void>;
    getConfig(): IExpressConfig | null;
    isEnabled(): boolean;
    route(): IRoute;
    getPort(): number | null;
    getRegisteredRoutes(): TRouteItem[];
    getServer(): http.Server | null;
    close(): void;
}

export default IHttpService;