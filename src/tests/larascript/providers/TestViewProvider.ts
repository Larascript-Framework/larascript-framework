import { IViewServiceConfig } from "@ben-shepherd/larascript-views-bundle";
import ViewProvider from "@src/core/providers/ViewProvider";
import path from "path";
class TestViewProvider extends ViewProvider {

    config: IViewServiceConfig = {
        resourcesDir: path.join(process.cwd(), 'src/tests/larascript/view/resources')
    }

}

export default TestViewProvider