import WelcomeController from "@/app/controllers/WelcomeController.js"
import { HttpRouter } from "@larascript-framework/larascript-http"

export default new HttpRouter().group(router => {

    router.get('/', WelcomeController)
    
})
