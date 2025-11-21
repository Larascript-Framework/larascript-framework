import { BaseSingleton } from "@larascript-framework/larascript-core";
import readline from "node:readline";
import { IConsoleInputService } from "../index.js";
import { ReadlineService } from "./ReadlineService.js";

export class ConsoleInputService
  extends BaseSingleton
  implements IConsoleInputService
{
  get rl(): readline.Interface {
    return ReadlineService.getInstance().readline();
  }

  /**
   * Wait for enter input
   * @param text
   * @returns
   */
  waitForEnter = (text = "Press Enter to continue"): Promise<void> => {
    return new Promise((resolve) => {
      this.rl.question(text, () => {
        resolve();
      });
    });
  };

  /**
   * Writes a line to the console
   * @param text
   */
  writeLine = (text: string = "") => {
    this.rl.write(text + "\n");
  };

  /**
   * Asks a question
   * @param question
   * @returns
   */
  askQuestion = (question: string): Promise<string> => {
    return new Promise((resolve) => {
      this.rl.question(question, (answer) => {
        resolve(answer);
      });
    });
  };

  /**
   * Normalize the value from the answer
   *
   * @param question
   * @returns
   */
  normalizeAnswer = (value: string = "", defaultValue = ""): string => {
    if (!value.length) {
      value = defaultValue;
    }

    if (value.toLowerCase() === "y" || value.toLowerCase() === "yes") {
      value = "true";
    }

    if (value.toLowerCase() === "n" || value.toLowerCase() === "no") {
      value = "false";
    }

    return value;
  };

  /**
   * Clears the screen
   */
  clearScreen = () => {
    this.rl.write("\x1B[2J\x1B[0f");
  };
}

export default ConsoleInputService;
