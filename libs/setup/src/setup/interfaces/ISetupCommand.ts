/* eslint-disable no-unused-vars */
import { IConsoleInputService } from '@larascript-framework/larascript-console';
import { IEnvService } from "@larascript-framework/larascript-core";

export interface ISetupCommand {
    env: IEnvService;
    setEnvService(env: IEnvService): void;
    input: IConsoleInputService;
    writeLine(line: string): void;
}