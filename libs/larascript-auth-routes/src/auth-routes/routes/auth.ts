import { IAuthRoutesConfig } from "@larascript-framework/contracts/auth";
import { AuthorizeMiddleware, HttpRouter, IRouter } from "@larascript-framework/larascript-http";
import AuthController from "../controller/AuthController.js";


export default (config: IAuthRoutesConfig): IRouter => {

    if (!config.routes.enabled) {
        return new HttpRouter();
    }

    return new HttpRouter().group(router => {
        return router.group({
            prefix: '/auth',
            controller: AuthController,
            config: {
                adapter: 'jwt'
            }
        }, (router) => {
    
            if (config.routes.endpoints.login) {
                router.post('/login', 'login');
            }
    
            if (config.routes.endpoints.register) {
                router.post('/register', 'register');
            }
    
            router.group({
                middlewares: [AuthorizeMiddleware]
            }, (router) => {
    
                if (config.routes.endpoints.login) {
                    router.get('/user', 'user');
                }
    
                if (config.routes.endpoints.update) {
                    router.patch('/update', 'update');
                }
    
                if (config.routes.endpoints.refresh) {
                    router.post('/refresh', 'refresh');
                }
    
                if (config.routes.endpoints.logout) {
                    router.post('/logout', 'logout');
                }
    
            })
    
        })
        
    })
}
