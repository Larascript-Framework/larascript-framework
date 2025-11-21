/* eslint-disable no-unused-vars */
import { NextFunction, Response } from 'express';
import { IApiTokenModel, IUserModel } from '../auth/index.js';
import { TBaseRequest } from "./BaseRequest.js";
import { TRouteItem } from "./IRouter.js";
import { TUploadedFile } from "./UploadedFile.js";

export interface IHttpContext {
    getRouteItem(): TRouteItem | undefined;
    getUser(): IUserModel | undefined;
    getApiToken(): IApiTokenModel | undefined;
    getMethod(): string;
    getParams(): Record<string, string>;
    getParam(key: string): string | undefined;
    getQueryParam(key: string): string | undefined;
    getQueryParams(): Record<string, string>;
    getBody(): Record<string, string>;
    getByRequest<T = unknown>(key: string): T | undefined;
    setContext(key: string, value: unknown): void;
    getIpContext<T = unknown>(key: string): T | undefined;
    setIpContext(key: string, value: unknown, ttl?: number): void;
    getId(): string;
    getRequest(): TBaseRequest;
    getResponse(): Response;
    getNext(): NextFunction | undefined;
    getFile(key: string): TUploadedFile | undefined;
    getFiles(key: string): TUploadedFile[] | undefined;
    uploadFile(file: TUploadedFile): Promise<TUploadedFile>;
    getValidatorBody(): Record<string, unknown>;
}

export interface IHasHttpContext {
    setHttpContext(context: IHttpContext): void;
    getHttpContext(): IHttpContext;
}