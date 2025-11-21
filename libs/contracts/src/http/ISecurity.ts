/* eslint-disable no-unused-vars */

import { Request } from 'express';
import { IHttpContext } from './IHttpContext.js';

export type TSecurityRuleOptions<RuleOptions extends object = object> = {
    id: string;
    when: string[] | null;
    never: string[] | null;
    ruleOptions?: RuleOptions;
}

export type TSecurityRuleConstructor<Rule extends ISecurityRule = ISecurityRule> = {
    new (...args: any[]): Rule
}

export interface ISecurityRule<RuleOptions extends object = object> {
    setRuleOptions(options: RuleOptions): ISecurityRule<RuleOptions>;
    getRuleOptions<T = RuleOptions>(): T
    getId(): string
    getWhen(): string[] | null
    getNever(): string[] | null
    execute(context: IHttpContext, ...args: any[]): Promise<boolean>
}

export type ISecurityRules = {
    create<Rule extends ISecurityRule = ISecurityRule>(
        ruleConstructor: TSecurityRuleConstructor<Rule>,
        options?: Rule extends ISecurityRule<infer O> ? O : object
    ): Rule;
    resourceOwner(attribute?: string): ISecurityRule;
    hasRole(roles: string | string[]): ISecurityRule;
    scopes(scopes: string | string[], exactMatch?: boolean): ISecurityRule;
    rateLimited(limit: number, perMinuteAmount: number): ISecurityRule;
}

export interface ISecurityRequest extends Request {
    security?: ISecurityRule[]
}