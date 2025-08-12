import { BaseProvider } from "@ben-shepherd/larascript-core";
import ConsoleService from "@src/core/domains/console/service/ConsoleService";
import readline from 'readline';

class TestConsoleProvider extends BaseProvider {

    async register(): Promise<void> {

        this.bind('readline', readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        }));
        this.bind('console', new ConsoleService());
    }

}

export default TestConsoleProvider