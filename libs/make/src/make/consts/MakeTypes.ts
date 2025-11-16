import MakeServices from "../services/MakeServices.js";

/**
 * Where the generated files should be placed
 * 
 * @note This MUST match the structure of the `templates` object
 */
export const targetDirectories = (): Record<string, string> => {
    const APP_PATH = MakeServices.getInstance().getPathToApp();

    return {
        Repository: `${APP_PATH}/repositories`,
        Model: `${APP_PATH}/models`,
        Listener: `${APP_PATH}/events/listeners`,
        Subscriber: `${APP_PATH}/events/subscribers`,
        Service: `${APP_PATH}/services`,
        Singleton: `${APP_PATH}/services`,
        Command: `${APP_PATH}/commands`,
        Observer: `${APP_PATH}/observers`,
        Provider: `${APP_PATH}/providers`,
        Routes: `${APP_PATH}/routes`,
        RouteResource: `${APP_PATH}/routes`,
        Middleware: `${APP_PATH}/middleware`,
        Controller: `${APP_PATH}/controllers`,
        Validator: `${APP_PATH}/validators`,
        Migration: `${APP_PATH}/migrations`,
        Seeder: `${APP_PATH}/seeders`,
        Factory: `${APP_PATH}/factory`,
    }
}

/**
 * Where the template files are located
 * 
 * @note This MUST match the structure of the `targetDirectories` object
 */
export const templates = (): Record<string, string> => {
    const TEMPLATE_PATH = MakeServices.getInstance().getPathToTemplates();

    return {
        Repository: `${TEMPLATE_PATH}/Repository.ts.template`,
        Model: `${TEMPLATE_PATH}/Model.ts.template`,
        Listener: `${TEMPLATE_PATH}/Listener.ts.template`,
        Subscriber: `${TEMPLATE_PATH}/Subscriber.ts.template`,
        Service: `${TEMPLATE_PATH}/Service.ts.template`,
        Singleton: `${TEMPLATE_PATH}/Singleton.ts.template`,
        Command: `${TEMPLATE_PATH}/Command.ts.template`,
        Observer: `${TEMPLATE_PATH}/Observer.ts.template`,
        Provider: `${TEMPLATE_PATH}/Provider.ts.template`,
        Routes: `${TEMPLATE_PATH}/Routes.ts.template`,
        RouteResource: `${TEMPLATE_PATH}/RouteResource.ts.template`,
        Middleware: `${TEMPLATE_PATH}/Middleware.ts.template`,
        Controller: `${TEMPLATE_PATH}/Controller.ts.template`,
        Validator: `${TEMPLATE_PATH}/Validator.ts.template`,
        Migration: `${TEMPLATE_PATH}/Migration.ts.template`,
        Seeder: `${TEMPLATE_PATH}/Seeder.ts.template`,
        Factory: `${TEMPLATE_PATH}/Factory.ts.template`,
    }
}

export default Object.freeze({
    targetDirectories,
    templates
})

