export interface IRuleConstructor {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  new (...args: any[]): IRule;
}

export interface IRulesObject {
  [key: string]: IRule | IRule[];
}

export interface IRuleError {
  [key: string]: string[];
}

export type IRuleContext = Record<string, unknown>;

export interface IRule {
  setDotNotationPath(field: string): this;
  getDotNotationPath(): string;
  setAttributeData(data: unknown): this;
  getAttributeData<T = unknown>(): T;
  setAttributes(attributes: unknown): this;
  setAttribute(attribute: string): this;
  getAttribute(): string;
  getAttributes<T = unknown>(): T;
  setMessages(messages: Record<string, string>): this;
  setOtherRuleNames(names: string[]): this;
  validate(): Promise<boolean>;
  getError(): IRuleError;
  getCustomError(): IRuleError | undefined;
  getName(): string;
  setContext(context: IRuleContext): void;
  getContext<T = unknown>(name: string): T | undefined;
}
