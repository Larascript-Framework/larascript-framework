import { BaseProvider, PackageJsonService } from "@ben-shepherd/larascript-core-bundle";
import path from "path";

class PackageJsonProvider extends BaseProvider {

    async register(): Promise<void> {
        const packageJsonService = new PackageJsonService({
            packageJsonPath: path.resolve('@src/../', 'package.json')
        }) 

        this.bind('packageJsonService', packageJsonService)
    }

}

export default PackageJsonProvider