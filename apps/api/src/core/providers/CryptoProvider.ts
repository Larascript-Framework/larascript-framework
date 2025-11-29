import appConfig, { IAppConfig } from "@/config/app.config.js";
import { CryptoService } from "@larascript-framework/crypto-js";
import { BaseProvider } from "@larascript-framework/larascript-core";

class CryptoProvider extends BaseProvider {
  config: IAppConfig = appConfig;

  async register(): Promise<void> {
    const cryptoService = new CryptoService({
      secretKey: this.config.appKey,
    });

    // Bind the crypto service
    this.bind("crypto", cryptoService);
  }
}

export default CryptoProvider;
