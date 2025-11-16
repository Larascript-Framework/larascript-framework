import { IRulesObject, IValidatorFn, IValidatorMessages } from "@larascript-framework/contracts/validator";
import { Validator } from "../index.js";

/**
 * Short hand for creating a new validator on the fly
 */
export const validatorFn: IValidatorFn = (rules: IRulesObject, messages: IValidatorMessages = {}) => Validator.make(rules, messages);

