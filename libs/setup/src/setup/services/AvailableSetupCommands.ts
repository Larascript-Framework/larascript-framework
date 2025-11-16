import { ICommand } from "@larascript-framework/larascript-console";
import AppSetupCommand from "../commands/AppSetupCommand.js";

type Constructor<T> = new (...args: any[]) => T;

export class AvailableSetupCommands {

    public static getCommands(): Constructor<ICommand>[] {
        return [
            AppSetupCommand
        ]
    }
}
