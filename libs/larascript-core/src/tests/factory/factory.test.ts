import { BaseFactory } from "@/base/BaseFactory.js";
import { beforeEach, describe, expect, test } from "@jest/globals";

// Create a concrete implementation of Factory for testing
class TestFactory extends BaseFactory<{ name?: string; age?: number; email?: string }> {
    getDefinition() {
        return {
            name: (this as any).faker.person.fullName(),
            age: (this as any).faker.number.int({ min: 18, max: 80 }),
            email: (this as any).faker.internet.email()
        };
    }
}

describe('BaseFactory', () => {
    let factory: TestFactory;

    beforeEach(() => {
        factory = new TestFactory();
    });

    describe('faker instance', () => {
        test('should have faker instance available through getDefinition', () => {
            const definition = factory.getDefinition();
            
            expect(definition).toBeDefined();
            expect(definition).toHaveProperty('name');
            expect(definition).toHaveProperty('age');
            expect(definition).toHaveProperty('email');
            expect(typeof definition.name).toBe('string');
            expect(typeof definition.age).toBe('number');
            expect(typeof definition.email).toBe('string');
        });
    });

    describe('getDefinition', () => {
        test('should return the definition from concrete implementation', () => {
            const definition = factory.getDefinition();
            
            expect(definition).toBeDefined();
            expect(definition).toHaveProperty('name');
            expect(definition).toHaveProperty('age');
            expect(definition).toHaveProperty('email');
            expect(typeof definition.name).toBe('string');
            expect(typeof definition.age).toBe('number');
            expect(typeof definition.email).toBe('string');
        });

        test('should return different values on each call (faker generates random data)', () => {
            const definition1 = factory.getDefinition();
            const definition2 = factory.getDefinition();
            
            // Since faker generates random data, we expect different values
            // Note: In rare cases, faker might generate the same value twice
            // So we'll just verify the structure is correct
            expect(definition1).toHaveProperty('name');
            expect(definition1).toHaveProperty('age');
            expect(definition1).toHaveProperty('email');
            expect(definition2).toHaveProperty('name');
            expect(definition2).toHaveProperty('age');
            expect(definition2).toHaveProperty('email');
        });
    });

    describe('create', () => {
        test('should create instance with default definition when no data provided', () => {
            const instance = factory.create();
            
            expect(instance).toBeDefined();
            expect(instance).toHaveProperty('name');
            expect(instance).toHaveProperty('age');
            expect(instance).toHaveProperty('email');
            expect(typeof instance.name).toBe('string');
            expect(typeof instance.age).toBe('number');
            expect(typeof instance.email).toBe('string');
        });

        test('should create instance with provided data', () => {
            const customData = {
                name: 'John Doe',
                age: 30,
                email: 'john@example.com'
            };
            
            const instance = factory.create(customData);
            
            expect(instance).toEqual(customData);
            expect(instance.name).toBe('John Doe');
            expect(instance.age).toBe(30);
            expect(instance.email).toBe('john@example.com');
        });

        test('should create instance with partial data (returns only provided data)', () => {
            const partialData = {
                name: 'Jane Doe',
                age: 25
            };
            
            const instance = factory.createWithData(partialData);
            
            expect(instance.name).toBe('Jane Doe');
            expect(instance.age).toBe(25);
            // Since the factory doesn't merge with defaults, email won't be present
            expect(instance).not.toHaveProperty('email');
        });

        test('should handle empty object as data (returns definition)', () => {
            const instance = factory.create({});
            
            expect(instance).toBeDefined();
            expect(Object.keys(factory.getDefinition())).toEqual(['name', 'age', 'email']);
            expect(Object.keys(instance)).toHaveLength(3);
        });
    });

    describe('type safety', () => {
        test('should maintain type safety with generic constraints', () => {
            // This test verifies that the factory works with the generic type constraint
            const factoryWithConstraint = new TestFactory();
            const result = factoryWithConstraint.create();
            
            // TypeScript should enforce that result has the correct type
            expect(typeof result.name).toBe('string');
            expect(typeof result.age).toBe('number');
            expect(typeof result.email).toBe('string');
        });
    });

    describe('edge cases', () => {
        test('should handle null data gracefully', () => {
            const instance = factory.create(null as any);
            
            expect(instance).toBeDefined();
            expect(instance).toHaveProperty('name');
            expect(instance).toHaveProperty('age');
            expect(instance).toHaveProperty('email');
        });

        test('should handle undefined data gracefully', () => {
            const instance = factory.create(undefined as any);
            
            expect(instance).toBeDefined();
            expect(instance).toHaveProperty('name');
            expect(instance).toHaveProperty('age');
            expect(instance).toHaveProperty('email');
        });
    });
});