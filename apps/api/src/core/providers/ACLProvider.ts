import { aclConfig } from "@/config/acl.config.js";
import { BasicACLService, IAclConfig } from "@larascript-framework/larascript-acl";
import { BaseProvider } from "@larascript-framework/larascript-core";

class ACLProvider extends BaseProvider {

    config: IAclConfig = aclConfig

    async register(): Promise<void> {
        this.bind('acl.basic', new BasicACLService(this.config));
        this.bind('acl.basic.config', this.config)
    }

}

export default ACLProvider;
