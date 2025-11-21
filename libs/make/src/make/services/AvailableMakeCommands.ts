import { ICommand } from "@larascript-framework/larascript-console";
import MakeCmdCommand from "../commands/MakeCmdCommand.js";
import MakeController from "../commands/MakeControllerCommand.js";
import MakeEventCommand from "../commands/MakeEventCommand.js";
import MakeFactoryCommand from "../commands/MakeFactoryCommand.js";
import MakeListenerCommand from "../commands/MakeListenerCommand.js";
import MakeMiddlewareCommand from "../commands/MakeMiddlewareCommand.js";
import MakeMigrationCommand from "../commands/MakeMigrationCommand.js";
import MakeModelCommand from "../commands/MakeModelCommand.js";
import MakeObserverCommand from "../commands/MakeObserverCommand.js";
import MakeProviderCommand from "../commands/MakeProviderCommand.js";
import MakeRepositoryCommand from "../commands/MakeRepositoryCommand.js";
import MakeRouteResourceCommand from "../commands/MakeRouteResourceCommand.js";
import MakeRoutesCommand from "../commands/MakeRoutesCommand.js";
import MakeSeederCommand from "../commands/MakeSeederCommand.js";
import MakeServiceCommand from "../commands/MakeServiceCommand.js";
import MakeSingletonCommand from "../commands/MakeSingletonCommand.js";
import MakeSubscriberCommand from "../commands/MakeSubscriberCommand.js";
import MakeValidatorCommand from "../commands/MakeValidatorCommand.js";

type Constructor<T> = new (...args: any[]) => T;

export class AvailableMakeCommands {

    public static getCommands(): Constructor<ICommand>[] {
        return [
            MakeCmdCommand,
            MakeListenerCommand,
            MakeEventCommand,
            MakeModelCommand,
            MakeObserverCommand,
            MakeRepositoryCommand,
            MakeServiceCommand,
            MakeSingletonCommand,
            MakeSubscriberCommand,
            MakeProviderCommand,
            MakeRoutesCommand,
            MakeRouteResourceCommand,
            MakeMiddlewareCommand,
            MakeController,
            MakeValidatorCommand,
            MakeMigrationCommand,
            MakeSeederCommand,
            MakeFactoryCommand
        ]
    }
}

export default AvailableMakeCommands;