/* eslint-disable @typescript-eslint/no-explicit-any */
import { IRule, IRuleContext, IRulesObject } from "./IRule.js";
import { IValidatorResult } from "./IValidatorResult.js";

export type CustomValidatorConstructor = {
  new (...args: any[]): IValidator;
};

export type ValidatorConstructor = {
  new (rules: IRule[], messages: IValidatorMessages): IValidator;
  make(rules: IRule[], messages: IValidatorMessages): IValidator;
};

export type IValidatorMessages = Record<string, string>;

export type IValidatorAttributes = Record<string, unknown>;

export type IValidatorErrors = Record<string, string[]>;

export type IValidatorFn = (
  rules: IRulesObject,
  messages?: IValidatorMessages,
) => IValidator;

export interface ISetRuleContext {
  setRuleContext(context?: IRuleContext): void;
}

export interface IValidator<
  Attributes extends IValidatorAttributes = IValidatorAttributes,
> extends ISetRuleContext {
  validate(
    data: Attributes,
    validator?: IValidator,
  ): Promise<IValidatorResult<Attributes>>;
  passes(): boolean;
  errors(): IValidatorErrors;
  validated(): Attributes;
  getRules(): IRulesObject;
  getMessages(): IValidatorMessages;
}
