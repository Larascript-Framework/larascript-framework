import { BaseSingleton } from "@/base/BaseSingleton.js";
import { EnvironmentType } from "@larascript-framework/contracts/larascript-core";

type AppEnvironmentConfig = {
  environment: EnvironmentType;
};

export class AppEnvironment extends BaseSingleton<AppEnvironmentConfig> {
  protected environment!: EnvironmentType;

  static create(environment: EnvironmentType) {
    return AppEnvironment.getInstance().setEnvironment(environment);
  }

  static reset() {
    AppEnvironment.getInstance().environment = undefined as unknown as EnvironmentType;
  }

  static env(): EnvironmentType {
    return AppEnvironment.getInstance().getEnvironment();
  }
  
  getEnvironment(): EnvironmentType {
    return this.environment;
  }

  setEnvironment(environment: EnvironmentType) {
    this.environment = environment;
  }

}