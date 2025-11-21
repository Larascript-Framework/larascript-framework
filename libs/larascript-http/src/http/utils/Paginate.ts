import { ParseRequestOptions } from "@larascript-framework/contracts/http";
import { Request } from "express";

/**
 * Paginate class
 * 
 * A utility class for handling pagination in HTTP requests. It extracts and manages
 * pagination parameters (page number and page size) from Express request query strings.
 * 
 * Example usage:
 * ```ts
 * const paginate = new Paginate();
 * paginate.parseRequest(req);
 * 
 * const page = paginate.getPage(); // Gets current page, defaults to 1
 * const pageSize = paginate.getPageSize(10); // Gets page size with default of 10
 * ```
 * 
 * The class supports:
 * - Parsing page and pageSize from request query parameters
 * - Configurable page size override through options
 * - Default values for both page and pageSize
 * - Method chaining for fluent API usage
 */
class Paginate {

    protected page: number = 1;

    protected pageSize: number = 10;

    protected totalCount: number = 0;

    /**
     * Parses the request object to extract the page and pageSize from the query string
     * 
     * @param {Request} req - The Express Request object
     * @param {ParseRequestOptions} options - The options for the request
     * @returns {Paginate} - The Paginate class itself to enable chaining
     */
    static parseRequest(req: Request, options: ParseRequestOptions = { allowPageSizeOverride: true, totalCount: 0 }): Paginate {
        const paginate = new Paginate();
        paginate.parseRequest(req, options);
        return paginate;
    }

    /**
     * Parses the request object to extract the page and pageSize from the query string
     * 
     * @param {Request} req - The Express Request object
     * @returns {this} - The Paginate class itself to enable chaining
     */
    parseRequest(req: Request, options: ParseRequestOptions = { allowPageSizeOverride: true, totalCount: 0 }): this {
        this.totalCount = options.totalCount;

        this.page = 1;
        if(req.query?.page) {
            this.page = parseInt(req.query?.page as string);
        }       

        this.pageSize = 10;
        if(options.allowPageSizeOverride && req.query?.pageSize) {
            this.pageSize = parseInt(req.query?.pageSize as string);
        }       

        return this
    }

    /**
     * Gets the page number, defaulting to 1 if undefined.
     * @param {number} defaultValue - The default value if this.page is undefined.
     * @returns {number} - The page number.
     */
    getPage(defaultValue: number = 1): number {
        return this.page ?? defaultValue
    }

    /**
     * Gets the next page number, defaulting to undefined if undefined.
     * @returns {number | undefined} - The next page number.
     */
    getNextPage(): number | undefined {
        const nextPage = this.page + 1;
        const nextSkip = this.getSkip(nextPage, this.pageSize);

        if(nextSkip >= this.totalCount) {
            return undefined;
        }

        return nextPage;
    }

    /**
     * Gets the previous page number, defaulting to 1 if undefined.
     * @returns {number | undefined} - The previous page number.
     */
    getPreviousPage(): number | undefined {
        const previousPage = this.page - 1;
        const previousSkip = this.getSkip(previousPage, this.pageSize);

        if(previousSkip < 0) {
            return 1
        }

        return previousPage;
    }

    /**
     * Gets the skip number, defaulting to 0 if undefined.
     * @returns {number} - The skip number.
     */
    getSkip(page: number = this.page, pageSize: number = this.pageSize): number {
        return (page - 1) * pageSize;
    }

    /**
     * Gets the page size, defaulting to the defaultValue if undefined.
     * @param {number} [defaultValue=undefined] - The default value if this.pageSize is undefined.
     * @returns {number | undefined} - The page size.
     */
    getPageSize(defaultValue?: number): number | undefined {
        return this.pageSize ?? defaultValue
    }

}

export default Paginate