import { AbstractProvider } from "@larascript-framework/bootstrap";
import {
  ValidatorServices,
  validatorFn,
} from "@larascript-framework/larascript-validator";
import { app } from "../services/App.js";

class ValidatorProvider extends AbstractProvider {
  async register(): Promise<void> {
    ValidatorServices.init({
      queryBuilder: app("query"),
      database: app("db"),
    });

    // Bind a helper function for on the fly validation
    this.bind("validatorFn", validatorFn);
  }
}

export default ValidatorProvider;
