import appConfig, { IAppConfig } from "@/config/app.config.js";
import { AbstractProvider } from "@larascript-framework/bootstrap";
import { CryptoService } from "@larascript-framework/crypto-js";

class CryptoProvider extends AbstractProvider {
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
