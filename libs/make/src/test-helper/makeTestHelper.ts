 
import { KeyPair, ParsedArgumentsArray } from '@larascript-framework/larascript-console';
import BaseMakeFileCommand from '../make/base/BaseMakeFileCommand.js';
import MakeCmdCommand from '../make/commands/MakeCmdCommand.js';
import MakeController from '../make/commands/MakeControllerCommand.js';
import MakeFactoryCommand from '../make/commands/MakeFactoryCommand.js';
import MakeListenerCommand from '../make/commands/MakeListenerCommand.js';
import MakeMiddlewareCommand from '../make/commands/MakeMiddlewareCommand.js';
import MakeMigrationCommand from '../make/commands/MakeMigrationCommand.js';
import MakeModelCommand from '../make/commands/MakeModelCommand.js';
import MakeObserverCommand from '../make/commands/MakeObserverCommand.js';
import MakeProviderCommand from '../make/commands/MakeProviderCommand.js';
import MakeRepositoryCommand from '../make/commands/MakeRepositoryCommand.js';
import MakeRouteResourceCommand from '../make/commands/MakeRouteResourceCommand.js';
import MakeRoutesCommand from '../make/commands/MakeRoutesCommand.js';
import MakeSeederCommand from '../make/commands/MakeSeederCommand.js';
import MakeServiceCommand from '../make/commands/MakeServiceCommand.js';
import MakeSingletonCommand from '../make/commands/MakeSingletonCommand.js';
import MakeSubscriberCommand from '../make/commands/MakeSubscriberCommand.js';
import MakeValidatorCommand from '../make/commands/MakeValidatorCommand.js';
import { targetDirectories } from '../make/consts/MakeTypes.js';

// eslint-disable-next-line no-unused-vars
export type CommandCtor<T extends BaseMakeFileCommand = BaseMakeFileCommand> = new (...args: any[]) => T;

/**
 * Get array of command types
 * e.g. Provider, Model, Repository etc.
 * 
 * @returns 
 */
export const getArrayOfCommandTypes = (): string[] => {
    return Object.keys(targetDirectories())
}

/**
 * Generate parsed arguments
 * 
 * @param fileName 
 * @param collectionName 
 * @returns 
 */
export const getParsedArguments = (fileName: string, collectionName: string): ParsedArgumentsArray => {
    return [
        {
            type: KeyPair,
            key: 'name',   
            value: fileName
        },
        {
            type: KeyPair,
            key: 'collection',   
            value: collectionName
        }
    ];
}

/**
 * Get command constructor by type
 * 
 * @param type 
 * @returns 
 */
export const getCommandCtorByType = (type: string): CommandCtor<BaseMakeFileCommand> => {
    switch(type) {
    case 'Repository':
        return MakeRepositoryCommand;
    case 'Model':
        return MakeModelCommand;
    case 'Listener':
        return MakeListenerCommand;
    case 'Subscriber':
        return MakeSubscriberCommand;
    case 'Service':
        return MakeServiceCommand;
    case 'Singleton':
        return MakeSingletonCommand;
    case 'Command':
        return MakeCmdCommand;
    case 'Observer':
        return MakeObserverCommand;
    case 'Provider':
        return MakeProviderCommand;
    case 'Routes':
        return MakeRoutesCommand;
    case 'Middleware':
        return MakeMiddlewareCommand;
    case 'Controller':
        return MakeController;
    case 'Validator':
        return MakeValidatorCommand;
    case 'Migration':
        return MakeMigrationCommand;
    case 'Seeder':
        return MakeSeederCommand;
    case 'Factory':
        return MakeFactoryCommand;
    case 'RouteResource':
        return MakeRouteResourceCommand;
    default:
        throw new Error(`Unknown command type '${type}'`)
    }
}

export default Object.freeze({
    getArrayOfCommandTypes,
    getParsedArguments,
    getCommandCtorByType
});