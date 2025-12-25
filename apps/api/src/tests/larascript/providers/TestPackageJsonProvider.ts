import PackageJsonProvider from "@/core/providers/PackageJsonProvider.js";
import { getOutputPath } from "@/tests/larascript/test-helper/getOutputPath.js";
import { PackageJsonServiceConfig } from "@larascript-framework/larascript-core";

class TestPackageJsonProvider extends PackageJsonProvider {
  config: PackageJsonServiceConfig = {
    packageJsonPath: getOutputPath("package.json"),
  };
}

export default TestPackageJsonProvider;
