 import readline from "node:readline";

/**
 * Interface for console input service
 */
export interface IConsoleInputService {
  /**
   * Reference to the readline interface
   */
  rl: readline.Interface;

  /**
   * Waits for the user to press enter
   * @param text The text to display before waiting for the user to press enter
   * @returns A promise that resolves once the user presses enter
   */
  waitForEnter(text?: string): Promise<void>;

  /**
   * Writes a line of text to the console
   * @param text The text to write to the console
   */
  writeLine(text?: string): void;

  /**
   * Normalizes the answer from the user. If the answer is empty, it will be replaced with the default value.
   * @param value The answer from the user
   * @param defaultValue The default value to use if the answer is empty
   * @returns The normalized answer
   */
  normalizeAnswer(value?: string, defaultValue?: string): string;

  /**
   * Asks the user a question and waits for them to answer
   * @param question The question to ask the user
   * @returns A promise that resolves with the user's answer
   */
  askQuestion(question: string): Promise<string>;

  /**
   * Clears the console screen
   */
  clearScreen(): void;
}
