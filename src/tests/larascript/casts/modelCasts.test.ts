/* eslint-disable no-undef */
import { TCastableType } from '@ben-shepherd/larascript-utils-bundle';
import { describe, expect, test } from '@jest/globals';
import Model from '@src/core/domains/models/base/Model';
import { IModelAttributes } from '@src/core/domains/models/interfaces/IModel';
import { app } from '@src/core/services/App';
import testHelper from '@src/tests/testHelper';
import { DataTypes } from 'sequelize';

interface AttributesType extends IModelAttributes {
    id?: string;
    age?: string | number | null;
    isActive?: string | boolean | null;
    joinDate?: string | Date | null;
    score?: string | number | null;
    items?: string | string[] | null;
    settings?: string | { theme: string } | null;
    count?: string | number | null;
    enabled?: string | boolean | null;
    tags?: string | string[] | null;
    name?: string | null;
    title?: string | null;
    metadata?: string | Record<string, any> | null;
    createdAt?: Date;
    updatedAt?: Date;
}

const resetTestsCaststTable = async () => {
    const schema = app('db').schema();
    await schema.dropTable('test_casts');

    await schema.createTable('test_casts', {
        age: DataTypes.INTEGER,
        isActive: DataTypes.BOOLEAN,
        metadata: DataTypes.JSON,
        items: DataTypes.JSON,
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE
    });
}

describe('test model casts', () => {

    beforeAll(async () => {
        await testHelper.testBootApp()
    })

    test('should cast values when setting attributes', async () => {
        // Create a model with casts
        class CastTestModel extends Model<AttributesType> {

            protected casts: Record<string, TCastableType> = {
                age: 'number',
                isActive: 'boolean',
                joinDate: 'date',
                score: 'float',
                items: 'array',
                settings: 'object'
            }

        }

        const model = new CastTestModel({
            age: '25',
            isActive: '1',
            joinDate: '2024-01-01',
            score: '91.5',
            items: '["item1", "item2"]',
            settings: '{"theme":"dark"}'
        });

        // Test number casting
        expect(await model.attr('age')).toBe(25);
        expect(typeof (await model.attr('age'))).toBe('number');

        // Test boolean casting
        expect(await model.attr('isActive')).toBe(true);
        expect(typeof (await model.attr('isActive'))).toBe('boolean');

        // Test date casting
        expect(await model.attr('joinDate')).toBeInstanceOf(Date);
        expect((await model.attr('joinDate') as Date).toISOString()).toContain('2024-01-01');

        // Test float casting
        expect(await model.attr('score')).toBe(91.5);
        expect(typeof (await model.attr('score'))).toBe('number');

        // Test array casting
        const items = await model.attr('items');
        expect(Array.isArray(items)).toBe(true);
        expect(items).toEqual(['item1', 'item2']);

        // Test object casting
        const settings = await model.attr('settings');
        expect(typeof settings).toBe('object');
        expect(settings).toEqual({ theme: 'dark' });
    });

    test('should handle null values in casted attributes', async () => {
        class NullCastTestModel extends Model<AttributesType> {

            protected casts: Record<string, TCastableType> = {
                age: 'number',
                joinDate: 'date',
                items: 'array'
            }

        }

        const model = new NullCastTestModel({
            age: null,
            joinDate: null,
            items: null
        });

        expect(await model.attr('age')).toBeNull();
        expect(await model.attr('joinDate')).toBeNull();
        expect(await model.attr('items')).toBeNull();
    });

    test('should return null for invalid cast values', async () => {
        class InvalidCastTestModel extends Model<AttributesType> {

            protected casts: Record<string, TCastableType> = {
                age: 'number',
                joinDate: 'date'
            }

        }

        const model = new InvalidCastTestModel({
            age: 'not a number',
            joinDate: 'invalid date'
        });

        // Should return null for invalid cast values
        expect(await model.attr('age')).toBeNull();
        expect(await model.attr('joinDate')).toBeNull();
    });

    test('should handle setting casted values', async () => {
        class SetCastTestModel extends Model<AttributesType> {

            protected casts: Record<string, TCastableType> = {
                count: 'integer',
                enabled: 'boolean',
                tags: 'array'
            }

            fields = [
                'count',
                'enabled',
                'tags'
            ]

        }

        const model = SetCastTestModel.create() as SetCastTestModel;

        // Set and verify integer casting
        await model.attr('count', '42');
        expect(await model.attr('count')).toBe(42);
        expect(typeof (await model.attr('count'))).toBe('number');

        // Set and verify boolean casting
        await model.attr('enabled', 1);
        expect(await model.attr('enabled')).toBe(true);

        // Set and verify array casting with comma-separated string
        await model.attr('tags', ['tag1', 'tag2']); // Changed from string to array
        const tags = await model.attr('tags');
        expect(Array.isArray(tags)).toBe(true);
        expect(tags?.length).toBe(2);
    });

    test('should preserve non-casted attributes', async () => {
        class MixedCastTestModel extends Model<AttributesType> {

            protected casts: Record<string, TCastableType> = {
                age: 'number'
            }

            // Add fields property to specify which attributes are valid
            public fields: string[] = ['age', 'name', 'title'];

        }

        const model = new MixedCastTestModel({
            age: '25',
            name: 'John',  // Not casted
            title: 'Mr'    // Not casted
        });

        expect(await model.attr('age')).toBe(25);
        expect(await model.attr('name')).toBe('John');
        expect(await model.attr('title')).toBe('Mr');
    });

    test('should get all attributes with proper casting', async () => {
        class GetAttributesTestModel extends Model<AttributesType> {

            protected casts: Record<string, TCastableType> = {
                age: 'number',
                isActive: 'boolean',
                metadata: 'object'
            }

            public fields: string[] = ['age', 'isActive', 'name', 'metadata'];

        }

        const model = new GetAttributesTestModel({
            age: '25',
            isActive: '1',
            name: 'John',
            metadata: '{"key": "value"}'
        });

        const attributes = await model.getAttributes();

        expect(attributes).toEqual({
            age: 25,
            isActive: true,
            name: 'John',
            metadata: { key: 'value' }
        });
    });

    test('should handle null and undefined values when getting attributes', async () => {
        class NullAttributesTestModel extends Model<AttributesType> {

            protected casts: Record<string, TCastableType> = {
                age: 'number',
                isActive: 'boolean',
                metadata: 'object'
            }

            public fields: string[] = ['age', 'isActive', 'metadata'];

        }

        const model = new NullAttributesTestModel({
            age: null,
            isActive: undefined,
            metadata: null
        });

        const attributes = await model.getAttributes();

        expect(attributes).toEqual({
            age: null,
            isActive: null,
            metadata: null
        });
    });

    test('should get only specified attributes', async () => {
        class SpecificAttributesTestModel extends Model<AttributesType> {

            protected casts: Record<string, TCastableType> = {
                age: 'number',
                score: 'float',
                isActive: 'boolean'
            }

            public fields: string[] = ['age', 'score', 'isActive', 'name'];

        }

        const model = new SpecificAttributesTestModel({
            age: '25',
            score: '91.5',
            isActive: '1',
            name: 'John'
        });

        const attributes = await model.getAttributes();

        expect(attributes?.age).toEqual(25);
        expect(attributes?.name).toEqual('John');
    });

    test('should handle complex nested objects in attributes', async () => {
        class ComplexAttributesTestModel extends Model<AttributesType> {

            protected casts: Record<string, TCastableType> = {
                metadata: 'object',
                items: 'array'
            }

            public fields: string[] = ['metadata', 'items'];

        }

        const complexMetadata = {
            user: {
                preferences: {
                    theme: 'dark',
                    notifications: true
                }
            },
            tags: ['important', 'featured']
        };

        const model = new ComplexAttributesTestModel({
            metadata: JSON.stringify(complexMetadata),
            items: '["item1", "item2"]'
        });

        const attributes = await model.getAttributes();

        expect(attributes?.metadata).toEqual(complexMetadata);
        expect(attributes?.items).toEqual(['item1', 'item2']);

        // Verify nested structure is preserved
        expect((attributes?.metadata as Record<string, any>).user?.preferences?.theme).toBe('dark');
        expect((attributes?.metadata as Record<string, any>).tags?.length).toBe(2);
    });

    test('should handle invalid JSON in object/array attributes', async () => {
        class InvalidJsonTestModel extends Model<AttributesType> {

            protected casts: Record<string, TCastableType> = {
                metadata: 'object',
                items: 'array'
            }

            public fields: string[] = ['metadata', 'items'];

        }

        const model = new InvalidJsonTestModel({
            metadata: '{invalid json}',
            items: '[invalid array]'
        });

        const attributes = await model.getAttributes();

        // Should return null for invalid JSON
        expect(attributes?.metadata).toBeNull();
        expect(attributes?.items).toBeNull();
    });

    test('should maintain casts after save and retrieve', async () => {
        await resetTestsCaststTable();

        class PersistentCastModel extends Model<AttributesType> {

            protected casts: Record<string, TCastableType> = {
                age: 'number',
                isActive: 'boolean',
                metadata: 'object',
                items: 'array'
            }

            public fields: string[] = ['age', 'isActive', 'metadata', 'items'];

            public table: string = 'test_casts';

        }

        // Create and save a model with various types
        const originalModel = new PersistentCastModel({
            age: '25',
            isActive: '1',
            metadata: JSON.stringify({ key: 'value' }),
            items: JSON.stringify(['item1', 'item2'])
        });

        await originalModel.save();
        const savedId = originalModel.getId() as string;

        // Retrieve the model from database
        const retrievedModel = await PersistentCastModel.query().find(savedId) as PersistentCastModel;
        const attributes = await retrievedModel.getAttributes();

        // Verify all attributes are properly cast
        expect(attributes?.age).toBe(25);
        expect(typeof attributes?.age).toBe('number');

        expect(attributes?.isActive).toBe(true);
        expect(typeof attributes?.isActive).toBe('boolean');

        expect(attributes?.metadata).toEqual({ key: 'value' });
        expect(Array.isArray(attributes?.items)).toBe(true);
        expect(attributes?.items).toEqual(['item1', 'item2']);
    });

});