import healthRoutes from "@/app/routes/health.js";
import { IRouter } from "@larascript-framework/contracts/http";
import { AuthRoutesService } from "@larascript-framework/larascript-auth-routes";

export const routesConfig = (): IRouter[] => ([
    healthRoutes,
    AuthRoutesService.getInstance().getRouter(),

    // Add your routes here
]);