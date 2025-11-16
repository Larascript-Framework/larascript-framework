import { ALWAYS } from "@/http/enums/SecurityEnum.js";
import { ISecurityRule, TRouteItem } from "@larascript-framework/contracts/http";

class SecurityReader {

    /**
     * Converts the security rule constructors into an array of security rule options.
     * 
     * @param routeOptions - The route resource options containing the security rule constructors.
     * @returns An array of security rule options.
     */
    protected static getSecurityRulesArray(routeOptions: TRouteItem): ISecurityRule[] {
        return routeOptions.security ?? [];
    }

    /**
     * Finds a security callback in the security callbacks of the given route r
     * esource options.
     *
     * @param routeOptions - The route resource options containing the security callbacks.
     * @param id - The id of the security callback to find.
     * @param when - The optional when condition. If specified, the security callback will only be found if it matches this condition.
     * @returns The found security callback, or undefined if not found.
     */
    public static findFromRouteResourceOptions(routeOptions: TRouteItem, id: string, when?: string[] | null): ISecurityRule | undefined {
        return this.find(routeOptions, id, when);
    }

    /**
     * Finds a security callback in the given array of security callbacks.
     *
     * @param security - The array of security callbacks to search.
     * @param options - The route resource options containing the security callbacks.
     * @param id - The id of the security callback to find.
     * @param when - The when condition to match. If not provided, the method will return the first match.
     * @returns The security callback if found, or undefined if not found.
     */
    public static find<Rule extends ISecurityRule = ISecurityRule>(routeOptions: TRouteItem, id: string, when?: string[] | null): Rule | undefined {
        const results = this.findMany(routeOptions, id, when);
        return results.length > 0 ? results[0] as Rule : undefined;
    }

    /**
     * Finds all security callbacks in the given array of security callbacks.
     * 
     * @param routeOptions - The route resource options containing the security callbacks.
     * @param id - The id of the security callback to find.
     * @param when - The when condition to match. If not provided, the method will return all matches.
     * @returns The security callbacks if found, or an empty array if not found.
     */
    public static findMany(routeOptions: TRouteItem, id: string, when?: string[] | null): ISecurityRule[] {
        const securityRules = this.getSecurityRulesArray(routeOptions);

        let result: ISecurityRule[] = [];

        when = when ?? null;
        when = when && typeof when === 'string' ? [when] : when;

        // Checks if the condition should never be passable
        const conditionNeverPassable = (conditions: string[] | null, never: string[] | null = null) => {
            if(!never) return false;

            for(const neverCondition of never) { 
                if(conditions?.includes(neverCondition)) return true;
            }

            return false;
        }

        // Checks if the condition should be passable
        const conditionPassable = (condition: string[] | null) => {
            if(!condition) {
                return true;
            }

            condition = typeof condition === 'string' ? [condition] : condition;

            if(when?.includes(ALWAYS)) return true;

            for(const conditionString of condition) {
                if(when?.includes(conditionString)) {
                    return true;
                }
            }

            return false;
        }

        /**
         * Find by 'id'
         */
        result = securityRules.filter(security => {
            const matchesIdentifier = security.getId() === id

            return matchesIdentifier && 
                conditionNeverPassable(when, security.getNever()) === false &&
                conditionPassable(security.getWhen());
        });


        return result;
    }

}

export default SecurityReader