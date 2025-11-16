import { IAuthRoutesConfig } from "@larascript-framework/contracts/auth";

export const routesConfig: IAuthRoutesConfig = {
    routes: {
        enabled: true,
        endpoints: {
            login: true,
            register: true,
            refresh: true,
            update: true,
            logout: true
        }
    }
}