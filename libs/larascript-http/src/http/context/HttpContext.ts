import { HttpEnvironment } from '@/http/environment/HttpEnvironment.js';
import { IApiTokenModel, IUserModel } from '@larascript-framework/contracts/auth';
import { IHttpContext, TBaseRequest, TRouteItem, TUploadedFile, TUploadedFileData } from '@larascript-framework/contracts/http';
import { IStorageFile } from '@larascript-framework/contracts/storage';
import { NextFunction, Response } from 'express';
import UploadedFile from '../data/UploadedFile.js';
import HttpContextException from '../exceptions/HttpContextException.js';
import { ResourceContext } from './ResourceContext.js';

export class HttpContext implements IHttpContext {

    constructor(
        // eslint-disable-next-line no-unused-vars
        protected req: TBaseRequest,
        // eslint-disable-next-line no-unused-vars
        protected res: Response,
        // eslint-disable-next-line no-unused-vars
        protected nextFn?: NextFunction,
        // eslint-disable-next-line no-unused-vars
        protected routeItem?: TRouteItem

    ) {
    }

    /**
     * Gets the resource context of the request.
     * @returns {ResourceContext} The resource context of the request.
     */
    get resourceContext() {
        return new ResourceContext(this)
    }

    /**
     * Gets the route item of the request.
     * @returns {TRouteItem} The route item of the request.
     */
    public getRouteItem(): TRouteItem | undefined {
        return this.routeItem
    }

    /**
     * Gets the user of the request.
     * @returns {IUserModel | undefined} The user of the request.
     */
    public getUser(): IUserModel | undefined {
        return this.req?.user as IUserModel | undefined;
    }

    /**
     * Gets the user of the request.
     * @returns {IUserModel} The user of the request.
     */
    public getUserOrFail(): IUserModel {
        const user = this.getUser()
        if(!user) {
            throw new HttpContextException('User not found')
        }
        return user
    }

    /**
     * Gets the API token of the request.
     * @returns {IApiTokenModel | undefined} The API token of the request.
     */
    public getApiToken(): IApiTokenModel | undefined {
        return this.req?.apiToken ?? undefined;
    }

    /**
     * Gets the method of the request.
     * @returns {string} The method of the request.
     */
    public getMethod() {
        return this.req.method
    }

    /**
     * Gets all parameters from the request.
     */
    public getParams(): Record<string, string> {
        return this.req.params
    }

    /**
     * Gets a parameter from the request.
     * @param {string} key - The key of the parameter to get.
     * @returns {string | undefined} The value of the parameter.
     */
    public getParam(key: string) {
        return this.req.params[key]
    }


    /**
     * Gets a query parameter from the request.
     * @param {string} key - The key of the query parameter to get.
     * @returns {string | undefined} The value of the query parameter.
     */


    public getQueryParam(key: string) {
        return this.req.query[key] as string | undefined
    }

    /**
     * Gets all query parameters from the request.
     * @returns {Record<string, string>} The query parameters.
     */
    public getQueryParams() {
        return this.req.query as Record<string, string>
    }

    /**
     * Gets all body parameters from the request.
     * @returns {Record<string, string>} The body parameters.
     */
    public getBody() {
        return this.req.body
    }

    /**
     * Gets the request context.
     * @returns {RequestContext | undefined} The request context.
     */
    public getByRequest<T = unknown>(key: string): T | undefined {
        return HttpEnvironment.getInstance().requestContext.getByRequest<T>(this.req, key)
    }

    /**
     * Sets the request context.
     * @param {string} key - The key of the value to set.
     * @param {unknown} value - The value to set.
     */
    public setContext(key: string, value: unknown): void {
        HttpEnvironment.getInstance().requestContext.setByRequest(this.req, key, value)
    }

    /**
     * Gets the IP context.
     * @param {string} key - The key of the value to get.
     * @returns {unknown} The value of the IP context.
     */
    public getIpContext<T = unknown>(key: string): T | undefined {
        return HttpEnvironment.getInstance().requestContext.getByIpAddress<T>(this.req, key)
    }

    /**
     * Sets the IP context.
     * @param {string} key - The key of the value to set.
     * @param {unknown} value - The value to set.
     */
    public setIpContext(key: string, value: unknown, ttl?: number): void {
        HttpEnvironment.getInstance().requestContext.setByIpAddress(this.req, key, value, ttl)
    }


    /**
     * Gets the ID of the current request.
     * @returns {string} The ID of the current request.
     */
    public getId(): string {
        if (!this.req.id) {
            throw new HttpContextException('Request ID not found');
        }
        return this.req.id;
    }

    /**
     * Gets the request object.
     * @returns {TBaseRequest} The request object.
     */
    public getRequest(): TBaseRequest {
        return this.req;
    }

    /**
     * Gets the response object.
     * @returns {Response} The response object.
     */
    public getResponse(): Response {
        return this.res;
    }

    /**
     * Gets the next function.
     * @returns {NextFunction | undefined} The next function.
     */
    public getNext(): NextFunction | undefined {
        return this.nextFn;
    }

    /**
     * Gets the file from the request.
     */
    public getFile(key: string): TUploadedFile | undefined {
        const files = this.req?.files?.[key];
        let data: TUploadedFileData | undefined = undefined

        if (!Array.isArray(files)) {
            data = files as unknown as TUploadedFileData
        }
        if (Array.isArray(files) && typeof files?.[0] !== 'undefined') {
            data = files?.[0] as unknown as TUploadedFileData
        }

        return data
            ? this.createUploadedFile(data)
            : undefined
    }

    /**
     * Gets the files from the request.
     */
    public getFiles(key: string): TUploadedFile[] | undefined {
        const files = this.req?.files?.[key];
        const filesArray = Array.isArray(files) ? files : [files]

        if (filesArray.length === 1 && typeof filesArray?.[0] === 'undefined') {
            return undefined
        }

        return (filesArray as unknown as TUploadedFileData[]).map((file) => {
            return this.createUploadedFile(file)
        })
    }

    /**
     * Create an UploadedFile data instance
     * @param file
     * @returns 
     */
    protected createUploadedFile(file: TUploadedFileData): TUploadedFile {
        return new UploadedFile(file)
    }

    /**
     * Moves an uploaded file from the request to the storage.
     * @param {string} key - The key of the file to upload.
     * @param {string} [destination] - Optional destination path in storage.
     * @returns {Promise<IStorageFile | undefined>} The stored file object or undefined if no file was found.
     */
    public async uploadFile(file: TUploadedFile): Promise<TUploadedFile> {
        return await HttpEnvironment.getInstance().uploadService.moveUploadedFile(file)
    }

    /**
     * Moves multiple uploaded files from the request to the storage.
     * @param {TUploadedFile[]} files - The files to upload.
     * @returns {Promise<TUploadedFile[]>} The uploaded files.
     */
    public async uploadFiles(files: TUploadedFile[]): Promise<TUploadedFile[]> {
        return Promise.all(files.map(async (file) => {
            return await HttpEnvironment.getInstance().uploadService.moveUploadedFile(file)
        }))
    }

    /**
     * Gets the body for validation (url params, with request body overwriting conflicts)
     * @returns 
     */
    public getValidatorBody(): Record<string, unknown> {
        return {
            ...(this.getParams()),
            ...(this.getRequest().body),
        }
    }

}


export default HttpContext;