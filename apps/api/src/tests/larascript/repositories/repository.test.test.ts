/* eslint-disable no-undef */
import { queryBuilder } from '@/core/services/QueryBuilder.js';
import TestPeopleModel, { resetPeopleTable } from '@/tests/larascript/eloquent/models/TestPeopleModel.js';
import TestPeopleRepository from '@/tests/larascript/repositories/TestPeopleRepository.js';
import testHelper, { forEveryConnection } from '@/tests/testHelper.js';
import { describe, test } from '@jest/globals';
import { Repository } from '@larascript-framework/larascript-database';

const resetAndPopulate = async () => {
    await resetPeopleTable()

    await forEveryConnection(async connectionName => {
        await queryBuilder(TestPeopleModel, connectionName).insert([
            {
                name: 'John',
                age: 30
            },
            {
                name: 'Jane',
                age: 25
            }
        ])
    })
}

describe('repository', () => {

    beforeAll(async () => {
        await testHelper.testBootApp()
    })

    test('repository findById', async () => {
        await resetAndPopulate()

        await forEveryConnection(async connectionName => {

            const all = await queryBuilder(TestPeopleModel, connectionName).all()
            expect(all.count()).toEqual(2)

            const johnId = all.where('name', '==', 'John').first()?.getId()
            expect(typeof johnId).toEqual('string')
            const repository = new Repository(TestPeopleModel, connectionName)
            const john = await repository.findById(johnId as string)
            
            expect(john).toBeTruthy()
            expect(john?.getAttributeSync('name')).toEqual('John')
        })
    })

    test('repository findMany', async () => {
        await resetAndPopulate()

        await forEveryConnection(async connectionName => {

            const all = (await queryBuilder(TestPeopleModel, connectionName).all()).toArray()
            expect(all.length).toEqual(2)

            const johnId = all.filter(model => model.getAttributeSync('name') === 'John')[0].getId()
            expect(typeof johnId).toEqual('string')
            const janeId = all.filter(model => model.getAttributeSync('name') === 'Jane')[0].getId()
            expect(typeof janeId).toEqual('string')

            const repository = new Repository(TestPeopleModel, connectionName)
            const findManyAll = await repository.findMany()
            expect(findManyAll.length).toEqual(2)

            const john = findManyAll.filter(model => model.getAttributeSync('name') === 'John')[0]
            const jane = findManyAll.filter(model => model.getAttributeSync('name') === 'Jane')[0]

            expect(john).toBeTruthy()
            expect(john?.getId()).toEqual(johnId as string)
            expect(jane).toBeTruthy()
            expect(jane?.getId()).toEqual(janeId as string)
        })
    })

    test('repository findOne', async () => {
        await resetAndPopulate()

        await forEveryConnection(async connectionName => {

            const all = (await queryBuilder(TestPeopleModel, connectionName).all()).toArray()
            expect(all.length).toEqual(2)

            const johnId = all.filter(model => model.getAttributeSync('name') === 'John')[0].getId()
            expect(typeof johnId).toEqual('string')


            const repository = new Repository(TestPeopleModel, connectionName)
            const findOneResult = await repository.findOne({
                age: 30 
            })

            expect(findOneResult).toBeTruthy()
            expect(findOneResult?.getAttributeSync('name')).toEqual('John')
            expect(findOneResult?.getId()).toEqual(johnId as string)
        })
    })

    test('repository custom method', async () => {
        await resetAndPopulate()

        await forEveryConnection(async connectionName => {

            const all = (await queryBuilder(TestPeopleModel, connectionName).all()).toArray()
            expect(all.length).toEqual(2)

            const janeId = all.filter(model => model.getAttributeSync('name') === 'Jane')[0].getId()
            expect(typeof janeId).toEqual('string')

            const repository = new TestPeopleRepository(connectionName)
            const jane = await repository.findOneJane()

            expect(jane).toBeTruthy()
            expect(jane?.getId()).toEqual(janeId as string)
            expect(jane?.getAttributeSync('name')).toEqual('Jane')
            expect(jane?.getAttributeSync('age')).toEqual(25)
            expect(jane?.getAttributeSync('id')).toEqual(janeId as string)
        })
    })
});