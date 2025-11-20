import ViewProvider from "@/core/providers/ViewProvider.js";
import { IViewServiceConfig } from "@larascript-framework/larascript-views";
import path from "path";
class TestViewProvider extends ViewProvider {

    config: IViewServiceConfig = {
        resourcesDir: path.join(process.cwd(), 'src/tests/larascript/view/resources')
    }

}

export default TestViewProvider