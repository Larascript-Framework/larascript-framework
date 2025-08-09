import { EnvironmentTesting } from "@ben-shepherd/larascript-core-bundle";
import { IAppConfig } from "@src/config/app.config";
import CryptoProvider from "@src/core/domains/crypto/providers/CryptoProvider";


class TestCryptoProvider extends CryptoProvider {

    config: IAppConfig = {
        env: EnvironmentTesting,
        appKey: 'test-app-key',
        appName: 'Larascript Framework'
    } as IAppConfig

}

export default TestCryptoProvider