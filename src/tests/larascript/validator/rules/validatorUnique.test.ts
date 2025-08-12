/* eslint-disable no-undef */
import { EmailRule, RequiredRule, Validator } from '@ben-shepherd/larascript-validator';
import { describe } from '@jest/globals';
import { queryBuilder } from '@src/core/domains/eloquent/services/EloquentQueryBuilderService';
import UniqueRule from '@src/core/domains/validator/rules/UniqueRule';
import TestEmailModel, { resetEmailTable } from '@src/tests/larascript/eloquent/models/TestEmailModel';
import testHelper from '@src/tests/testHelper';


describe('test validation', () => {

    const email = 'test@test.com'

    beforeAll(async () => {
        await testHelper.testBootApp()
    })

    test('email does not exist, passes, uses model constructor', async () => {
        await resetEmailTable()

        const validator = Validator.make({
            email: [new RequiredRule(), new EmailRule(), new UniqueRule(TestEmailModel, 'email')]
        })
        const result = await validator.validate({
            email
        })

        expect(result.passes()).toBe(true)
    })

    test('email is not unique, fails', async () => {
        await resetEmailTable()

        await queryBuilder(TestEmailModel).insert({
            email
        })  

        const validator = Validator.make({
            email: [new RequiredRule(), new EmailRule(), new UniqueRule(TestEmailModel, 'email')]
        })
        const result = await validator.validate({
            email
        })

        expect(result.fails()).toBe(true)
        expect(result.errors()).toEqual({
            email: ['The email field must be unique.']
        })
    })

    test('email is not unique, with custom message', async () => {
        await resetEmailTable()

        await queryBuilder(TestEmailModel).insert({
            email
        })  

        const validator = Validator.make({
            email: [new RequiredRule(), new EmailRule(), new UniqueRule(TestEmailModel, 'email')]
        }, {
            'email.unique': 'The email has already been taken.'
        })
        const result = await validator.validate({
            email
        })

        expect(result.fails()).toBe(true)
        expect(result.errors()).toEqual({
            email: ['The email has already been taken.']
        })
    })

    test('email is unique when using where clause', async () => {
        await resetEmailTable()

        // Insert a soft-deleted record
        await queryBuilder(TestEmailModel).insert({
            email,
            deletedAt: new Date()
        })

        const validator = Validator.make({
            email: [
                new RequiredRule(), 
                new EmailRule(), 
                new UniqueRule(TestEmailModel, 'email').where('deletedAt', '=', null)
            ]
        })
        const result = await validator.validate({
            email
        })

        expect(result.passes()).toBe(true)
    })


    test('validates multiple unique fields', async () => {
        await resetEmailTable()

        await queryBuilder(TestEmailModel).insert({
            email,
            username: 'testuser'
        })

        const validator = Validator.make({
            email: [new RequiredRule(), new EmailRule(), new UniqueRule(TestEmailModel, 'email')],
            username: [new RequiredRule(), new UniqueRule(TestEmailModel, 'username')]
        })
        const result = await validator.validate({
            email: 'different@test.com',
            username: 'testuser'
        })

        expect(result.fails()).toBe(true)
        expect(result.errors()).toEqual({
            username: ['The username field must be unique.']
        })
    })
});