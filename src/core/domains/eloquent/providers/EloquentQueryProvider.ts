import { BaseProvider } from "@ben-shepherd/larascript-core";
import EloquentQueryBuilderService from "@src/core/domains/eloquent/services/EloquentQueryBuilderService";

class EloquentQueryProvider extends BaseProvider {

    /**
     * EloquentQueryProvider class
     * 
     * This provider is responsible for registering the QueryService into the App container.
     * The QueryService provides a fluent interface for database queries using the Eloquent ORM pattern.

     * @see EloquentQueryBuilderService
     */
    async register() {
        this.bind('query', new EloquentQueryBuilderService());
    }

}

export default EloquentQueryProvider;