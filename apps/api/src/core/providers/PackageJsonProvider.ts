import {
  BaseProvider,
  PackageJsonService,
  PackageJsonServiceConfig,
} from "@larascript-framework/larascript-core";
import path from "path";

class PackageJsonProvider extends BaseProvider {
  protected config: PackageJsonServiceConfig = {
    packageJsonPath: path.resolve("@/../", "package.json"),
  };

  async register(): Promise<void> {
    const packageJsonService = new PackageJsonService(this.config);
    this.bind("packageJsonService", packageJsonService);
  }
}

export default PackageJsonProvider;
