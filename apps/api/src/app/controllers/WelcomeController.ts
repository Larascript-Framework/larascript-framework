import { Controller, HttpContext } from "@larascript-framework/larascript-http";

class WelcomeController extends Controller {

    async invoke(context: HttpContext) {
        this.render('welcome', {
            title: 'Welcome to Larascript Framework',
            requestId: context.getRequest().id,
        })
    }

}

export default WelcomeController;
