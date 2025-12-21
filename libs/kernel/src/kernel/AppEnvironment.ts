import { InstanceTypePrivateConstructor } from "@/contracts/instance.js";
import { AppEnvironmentException } from "@/exceptions/AppEnvironmentException.js";

export class AppEnvironment {
  private constructor(private environment: string) {}
  
  private static instance: AppEnvironment;

  static getInstance(): AppEnvironment
  {
    if(false === this.instance instanceof AppEnvironment) {
      throw AppEnvironmentException.notCreated()
    }

    return this.instance
  }

  static create(environment: string): AppEnvironment {
    if(this.instance instanceof AppEnvironment) {
      return this.instance
    }
    this.instance = new AppEnvironment(environment)
    return this.instance
  }

  static reset() {
    this.instance = undefined as unknown as InstanceTypePrivateConstructor<AppEnvironment>
  }

  static env(): string {
    if(typeof this.instance.environment !== 'string') {
      throw AppEnvironmentException.envNotSet()
    }
    return this.instance.environment
  }

  static setEnv(environment: string) {
    this.instance.environment = environment;
  }

}