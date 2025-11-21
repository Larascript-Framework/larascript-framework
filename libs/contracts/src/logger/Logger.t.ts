/* eslint-disable @typescript-eslint/no-explicit-any */
import winston from "winston";

export type ILoggerConfig = {
  logPath: string;
};

export interface ILoggerService {
  boot(): void;
  getLogger(): winston.Logger;
  info(...args: any[]): void;
  warn(...args: any[]): void;
  error(...args: any[]): void;
  debug(...args: any[]): void;
  verbose(...args: any[]): void;
  console(...args: any[]): void;
  exception(err: Error): void;
}
