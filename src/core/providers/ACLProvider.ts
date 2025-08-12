import { BasicACLService, IAclConfig } from "@ben-shepherd/larascript-acl";
import { BaseProvider } from "@ben-shepherd/larascript-core";
import { aclConfig } from "@src/config/acl.config";

class ACLProvider extends BaseProvider {

    config: IAclConfig = aclConfig

    async register(): Promise<void> {
        this.bind('acl.basic', new BasicACLService(this.config));
        this.bind('acl.basic.config', this.config)
    }

}

export default ACLProvider;
