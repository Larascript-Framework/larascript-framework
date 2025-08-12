import { BaseProvider } from "@ben-shepherd/larascript-core";
import { validatorFn } from "@src/core/domains/validator/service/validatorFn";

class ValidatorProvider extends BaseProvider {

    async register(): Promise<void> {
        this.log('Registering ValidatorProvider');

        // Bind a helper function for on the fly validation
        this.bind('validatorFn', validatorFn);

    }

}

export default ValidatorProvider