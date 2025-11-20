import { ApiToken, ApiTokenAttributes } from "@larascript-framework/larascript-auth";

class TestApiTokenModel extends ApiToken {
    constructor(data: ApiTokenAttributes | null = null) {
        super(data);
    }
}

export default TestApiTokenModel
