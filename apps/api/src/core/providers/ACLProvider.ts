import { aclConfig } from "@/config/acl.config.js";
import { AbstractProvider } from "@larascript-framework/bootstrap";
import { IAclConfig } from "@larascript-framework/contracts/acl";
import { BasicACLService } from "@larascript-framework/larascript-acl";

class ACLProvider extends AbstractProvider {
  config: IAclConfig = aclConfig;

  async register(): Promise<void> {
    this.bind("acl", new BasicACLService(this.config));
    this.bind("acl.config", this.config);
  }
}

export default ACLProvider;
