import { BaseProvider } from "@ben-shepherd/larascript-core";

class BaseRoutesProvider extends BaseProvider {

    async register(): Promise<void> {
        this.bind('routes.provided', true);
    }

}


export default BaseRoutesProvider;