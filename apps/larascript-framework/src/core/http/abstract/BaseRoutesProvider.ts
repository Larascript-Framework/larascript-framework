import { BaseProvider } from "@larascript-framework/larascript-core";

class BaseRoutesProvider extends BaseProvider {

    async register(): Promise<void> {
        // We set this to true to indicate that the routes have been provided
        // This is used in HttpErrorHandlerProvider to check if the routes have been provided
        // If not, it will throw an error
        this.bind('routes.provided', true);
    }

}


export default BaseRoutesProvider;