import { BaseSingleton } from "@larascript-framework/larascript-core";
import readline, { createInterface } from "node:readline";

export class ReadlineService extends BaseSingleton {
    rl: readline.Interface;

    constructor() {
        super();
        this.rl = createInterface({
            input: process.stdin,
            output: process.stdout,
        });
    }

    readline() {
        return this.rl;
    }
}