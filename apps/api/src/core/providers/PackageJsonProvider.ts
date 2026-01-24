import { AbstractProvider } from "@larascript-framework/bootstrap";
import {
  PackageJsonService,
  PackageJsonServiceConfig
} from "@larascript-framework/larascript-core";
import path from "path";

class PackageJsonProvider extends AbstractProvider {
  protected config: PackageJsonServiceConfig = {
    packageJsonPath: path.resolve("@/../", "package.json"),
  };

  async register(): Promise<void> {
    const packageJsonService = new PackageJsonService(this.config);
    this.bind("packageJsonService", packageJsonService);
  }
}

export default PackageJsonProvider;
