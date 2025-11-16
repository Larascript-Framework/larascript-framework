import { EnvironmentType } from "./environment.js";
import { IProvider } from "./provider.js";

export type KernelOptions = {
    withoutProvider?: string[];
};
export type KernelConfig = {
    environment: EnvironmentType;
    providers: IProvider[];
};