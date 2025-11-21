import { HttpEnvironment } from "@/http/environment/HttpEnvironment.js";
import { QueryFilterOptions } from "@larascript-framework/contracts/http";
import { Request } from "express";

/**
 * QueryFilters is a singleton class that handles parsing and validating URL query string filters
 * for Express.js applications. It processes the 'filters' parameter from request query strings,
 * which can be either a URL-encoded JSON string or an object.
 * 
 * Key features:
 * - Parses URL-encoded filter parameters from request queries
 * - Supports both string (encoded JSON) and object filter formats
 * - Validates filters against allowed fields
 * - Provides a fluent interface through method chaining
 * - Implements the Singleton pattern to ensure a single instance
 * 
 * Example usage:
 * GET /api/users?filters={"status":"active","role":"admin"}
 * GET /api/users?filters[status]=active&filters[role]=admin
 * 
 * The class will decode and parse these filters, ensuring only allowed fields
 * are included in the final filters object.
 */
class QueryFilters {

    filters: object = {}

    static parseRequest(req: Request, options: QueryFilterOptions = {}): QueryFilters {
        return new QueryFilters(options).parseRequest(req);
    }

    constructor(protected options: QueryFilterOptions = {}) {}

    /**
     * Parses the request object to extract the filters from the query string
     * 
     * @param {Request} req - The Express Request object
     * @throws {QueryFiltersException} Throws an exception if the filters are not a string or an object
     * @returns {this} - The QueryFilters class itself to enable chaining
     */
    parseRequest(req: Request): this {
        try {
            this.filters = this.decodeFilters(req);
            this.filters = this.filtersWithPercentSigns(this.filters)
            this.filters = this.stripNonAllowedFields(this.filters)
            this.filters = {
                ...(this.options.baseFilters ?? {}),
                ...this.filters
            }
        }
        catch (err) { 
            HttpEnvironment.getInstance().loggerService?.error((err as Error).message, (err as Error).stack)
        }

        return this;
    }

    /**
     * Decodes the filters from the request query string
     * 
     * @param {Request} req - The Express Request object
     * @returns {object} - The decoded filters
     */
    private decodeFilters(req: Request): object {
        let decodedFilters: object = {};

        if (typeof req.query?.filters === 'string') {
            decodedFilters = JSON.parse(decodeURIComponent(req.query?.filters)) ?? {};
        }
        else if (typeof req.query.filters === 'object') {
            decodedFilters = req.query?.filters ?? {};
        }
        return decodedFilters;
    }

    /**
     * Returns the filters with percent signs
     * 
     * @param {object} filters - The filters object
     * @returns {object} - The filters with percent signs
     */
    filtersWithPercentSigns(filters: object): object {
        if(!this.options.fuzzy) {
            return filters
        }

        return {
            ...filters,
            ...Object.keys(filters).reduce((acc, curr) => {
                const value = filters[curr];

                if (value === true || value === false) {
                    acc[curr] = value.toString();
                }
                else if (value === 'true' || value === 'false') {
                    acc[curr] = value;
                }
                else {
                    acc[curr] = `%${value}%`;
                }

                return acc;
            }, {})
        }

    }
    /**
     * Strips the non-allowed fields from the filters
     * 
     * @param {object} filters - The filters object
     * @param {string[]} allowedFields - The allowed fields
     * @returns {object} - The stripped filters object
     */
    protected stripNonAllowedFields(filters: object): object {
        const { allowedFields = [] } = this.options;

        if(allowedFields.length === 0) {
            return filters;
        }

        return Object.keys(filters).filter(key => allowedFields.includes(key)).reduce((acc, key) => {
            acc[key] = filters[key];
            return acc;
        }, {});
    }

}

export default QueryFilters