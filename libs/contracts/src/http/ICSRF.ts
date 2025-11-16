export interface ICsrfConfig {

    /** HTTP methods that require CSRF validation */
    methods?: string[];

    /** Cookie name for the CSRF token */
    cookieName?: string;

    /** Header name for the CSRF token */
    headerName?: string;

    /** How long the token is valid for (in seconds) */
    ttl?: number;

    /** Exclude routes from CSRF protection */
    exclude?: string[];
}