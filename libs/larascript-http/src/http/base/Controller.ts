import { AppEnvironment } from "@larascript-framework/bootstrap";
import { IController, IHttpContext, TRouteItem } from "@larascript-framework/contracts/http";
import HttpContext from "../context/HttpContext.js";
import responseError from "../handlers/responseError.js";

export class Controller implements IController {

    /** 
     * The context of the controller.
     */
    protected context!: IHttpContext;

    /**
     * The constructor of the controller.
     * @param context The context of the controller.
     * @param options The route item options.
     */
    constructor(context: IHttpContext) {
        this.context = context
    }

    /**
     * Executes an action on the controller.
     * @param action The action to execute.
     * @param context The context of the controller.
     * @returns The result of the action.
     */
    static async executeAction(action: string, context: HttpContext): Promise<void> {

        // Inject URL params as action arguments
        // Add the context as the last argument
        const params = context.getParams()
        const actionArgs = [
            ...Object.keys(params).map(key => params[key]),
            context
        ]

        const controller = new this(context)

        if (!controller[action]) {
            responseError(context.getRequest(), context.getResponse(), new Error(`Invalid action "${action}"`))
            return
        }

        await controller[action](...actionArgs)
    }

    /**
     * Sets the context of the controller.

     * @param context The context to set.
     */
    public setContext(context: HttpContext) {
        this.context = context
    }

    /**
     * Gets the route item options.
     * @returns The route item options.
     */
    public getRouteOptions(): TRouteItem | undefined {
        return this.context.getRouteItem()
    }

    /**
     * Sends a view response.
     * @param view 
     * @param data 
     */
    protected render(view: string, data: Record<string, unknown>) {
        this.context.getResponse().render(view, data)
    }

    /**
     * Sends a JSON response.
     * @param message The message to send.
     */
    protected jsonResponse(data: object, code: number = 200) {
        this.context.getResponse().setHeader('Content-Type', 'application/json')
        this.context.getResponse().status(code).send(data)
    }

    /**
     * Sends a successful JSON response with 200 status code
     * @param data The data to send
     */
    protected ok(data: object) {
        return this.jsonResponse(data, 200);
    }

    /**
     * Sends a created JSON response with 201 status code
     * @param data The data to send
     */
    protected created(data: object) {
        return this.jsonResponse(data, 201);
    }

    /**
     * Sends a no content response with 204 status code
     */
    protected noContent() {
        this.context.getResponse().status(204).send();
    }

    /**
     * Sends a bad request response with 400 status code
     * @param message Error message
     */
    protected badRequest(message: string = 'Bad Request') {
        return this.jsonResponse({ error: message }, 400);
    }

    /**
     * Sends an unauthorized response with 401 status code
     * @param message Error message
     */
    protected unauthorized(message: string = 'Unauthorized') {
        return this.jsonResponse({ error: message }, 401);
    }

    /**
     * Sends a forbidden response with 403 status code
     * @param message Error message
     */
    protected forbidden(message: string = 'Forbidden') {
        return this.jsonResponse({ error: message }, 403);
    }

    /**
     * Sends a not found response with 404 status code
     * @param message Error message
     */
    protected notFound(message: string = 'Not Found') {
        return this.jsonResponse({ error: message }, 404);
    }

    /**
     * Sends an internal server error response with 500 status code
     * @param message Error message
     */
    protected serverError(message: string | Error | undefined = 'Internal Server Error') {
        const errorMessage = message instanceof Error ? message.message : message

        if (AppEnvironment.env() === 'development') {
            return this.jsonResponse({
                error: errorMessage,
                stack: message instanceof Error ? message.stack?.split('\n').map(line => line.trim()) : undefined
            }, 500);
        }

        return this.jsonResponse({ error: 'Internal Server Error' }, 500);
    }

    /**
     * Redirects to a specified URL
     * @param url The URL to redirect to
     * @param statusCode The status code to use (default: 302)
     */
    protected redirect(url: string, statusCode: number = 302) {
        this.context.getResponse().redirect(statusCode, url);
    }

}

export default Controller