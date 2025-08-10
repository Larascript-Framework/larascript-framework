/* eslint-disable no-undef */
import { describe } from '@jest/globals';
import { queryBuilder } from '@src/core/domains/eloquent/services/EloquentQueryBuilderService';
import EmailRule from '@src/core/domains/validator/rules/EmailRule';
import ExistsRule from '@src/core/domains/validator/rules/ExistsRule';
import RequiredRule from '@src/core/domains/validator/rules/RequiredRule';
import Validator from '@src/core/domains/validator/service/validatorFn';
import TestEmailModel, { resetEmailTable } from '@src/tests/larascript/eloquent/models/TestEmailModel';
import testHelper from '@src/tests/testHelper';


describe('test validation', () => {

    const email = 'test@test.com'

    beforeAll(async () => {
        await testHelper.testBootApp()
    })

    test('email is exists, passes', async () => {
        await resetEmailTable()

        await queryBuilder(TestEmailModel).insert({
            email
        })  

        const validator = Validator.make({
            email: [new RequiredRule(), new EmailRule(), new ExistsRule(TestEmailModel, 'email')]
        })
        const result = await validator.validate({
            email
        })

        expect(result.passes()).toBe(true)
    })

    test('email does not exist, fails', async () => {
        await resetEmailTable()

        const validator = Validator.make({
            email: [new RequiredRule(), new EmailRule(), new ExistsRule(TestEmailModel, 'email')]
        })
        const result = await validator.validate({
            email,
        })

        expect(result.fails()).toBe(true)
        expect(result.errors()).toEqual({
            email: ['The email field must exist.']
        })
    })

    test('email does not exist, with custom message', async () => {
        await resetEmailTable()

        const validator = Validator.make({
            email: [new RequiredRule(), new EmailRule(), new ExistsRule(TestEmailModel, 'email')]
        }, {
            'email.exists': 'The email does not exist.'
        })
        const result = await validator.validate({
            email
        })

        expect(result.passes()).toBe(false)
        expect(result.errors()).toEqual({
            'email': ['The email does not exist.']
        })
    })
});