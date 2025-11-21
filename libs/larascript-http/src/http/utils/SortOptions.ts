import { Request } from "express";
import { TSortDefaults, TSortDirection, TSortResult } from "node_modules/@larascript-framework/contracts/dist/http/ISorting.js";

const DEFAULT_SORT_OPTIONS: TSortDefaults = {
    defaultField: 'createdAt',
    defaultDirection: 'asc'
}

/**
 * SortOptions class
 * 
 * A utility for extracting and normalizing sorting parameters from Express request
 * query strings. It reads `req.query.sort` as a map of `{ [field]: direction }`
 * and converts various direction formats to a normalized `'asc' | 'desc'` value.
 * 
 * Example usage:
 * ```ts
 * // Assuming an Express handler
 * const sort = new SortOptions();
 * sort.parseRequest(req);
 * 
 * // Results as a normalized mapping of field -> direction
 * const directions = sort.results; // e.g., { createdAt: 'desc', name: 'asc' }
 * ```
 * 
 * Another example with defaults:
 * ```ts
 * const sort = new SortOptions()
 *   .parseRequest(req, { defaultDirection: 'desc' });
 * 
 * const directions = sort.results; // e.g., { createdAt: 'desc' }
 * ```
 * 
 * The class supports:
 * - Parsing multiple fields from `req.query.sort`
 * - Normalizing direction values: '-', 'desc', -1 => 'desc'; 'asc', 1, or other => 'asc'
 * - Supplying default options such as `defaultDirection`
 * - Method chaining for fluent usage
 */
class SortOptions {

    /**
     * The results of the sorting
     */
    results: TSortResult = {};

    /**
     * Parses the request to extract and normalize sorting from `req.query.sort`.
     *
     * Each entry in `req.query.sort` is treated as `{ [field]: direction }` where
     * direction can be a string (e.g. "asc", "desc", "-"-prefixed) or a number (1, -1).
     * Normalization rules:
     * - leading '-' or 'desc' or -1 => 'desc'
     * - 'asc' or 1 or any other value => 'asc'
     *
     * @param {Request} req - The Express Request object
     * @param {TSortDefaults} options - Parsing options (e.g. defaultDirection)
     * @returns {this} - The SortOptions instance to enable chaining
     */
    static parseRequest(req: Request, options: TSortDefaults = DEFAULT_SORT_OPTIONS): SortOptions {
       return new SortOptions().parseRequest(req, options);
    }

    /**
     * Parses the request object to extract the sort from the query string
     * 
     * @param {Request} req - The Express Request object
     * @returns {this} - The SortOptions class itself to enable chaining
     */
    parseRequest(req: Request, options: TSortDefaults = DEFAULT_SORT_OPTIONS): SortOptions {
        let result: TSortResult = {}
        const requestSort = req.query?.sort ?? {}

        Object.entries(requestSort).forEach(([field, direction]) => {
            result[field] = SortOptions.normalizeDirection(direction as string, options.defaultDirection);
        });

        // If no results are found, create the default results
        if(Object.keys(result).length === 0) {
            result = this.createDefaultResults(options);
        }

        this.results = result;
        return this;
    }

    /**
     * Creates the default results
     * 
     * @param {TSortDefaults} options - The options
     * @returns {TSortResult} - The default results
     */
    private createDefaultResults(options: TSortDefaults): TSortResult {
        if(!options.defaultField || !options.defaultDirection) {
            return {}
        }
        return {
            [options.defaultField]: options.defaultDirection
        }
    }

    /**
     * Parses the sort string to determine the direction
     * 
     * @param {string} rawDirection - The sort string
     * @returns {string} - The direction
     */
    static normalizeDirection(rawDirection?: string, defaultDiretion: TSortDirection = 'asc'): TSortDirection {

        if(!rawDirection) {
            return defaultDiretion
        }

        if(rawDirection.startsWith('-')) {
            return 'desc'
        }

        if(rawDirection.toLocaleLowerCase() === 'desc') {
            return 'desc'
        }

        if(!isNaN(Number(rawDirection)) && Number(rawDirection) === -1) {
            return 'desc'
        }

        if(!isNaN(Number(rawDirection)) && Number(rawDirection) === 1) {
            return 'asc'
        }

        return 'asc'
    }
}


export default SortOptions