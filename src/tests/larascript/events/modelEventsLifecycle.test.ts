/* eslint-disable no-undef */
import { EnvironmentTesting, Kernel, KernelConfig } from '@ben-shepherd/larascript-core-bundle';
import { describe } from '@jest/globals';
import { EVENT_DRIVERS } from '@src/config/events.config';
import EloquentQueryProvider from '@src/core/domains/eloquent/providers/EloquentQueryProvider';
import BaseEvent from '@src/core/domains/events/base/BaseEvent';
import SyncDriver from '@src/core/domains/events/drivers/SyncDriver';
import EventNotDispatchedException from '@src/core/domains/events/exceptions/EventNotDispatchedException';
import { IEventConfig } from '@src/core/domains/events/interfaces/config/IEventConfig';
import EventProvider from '@src/core/domains/events/providers/EventProvider';
import EventRegistry from '@src/core/domains/events/registry/EventRegistry';
import EventService from '@src/core/domains/events/services/EventService';
import LoggerProvider from '@src/core/domains/logger/providers/LoggerProvider';
import Model from '@src/core/domains/models/base/Model';
import { IModelAttributes } from '@src/core/domains/models/interfaces/IModel';
import ValidatorProvider from '@src/core/domains/validator/providers/ValidatorProvider';
import { app } from '@src/core/services/App';
import TestAuthProvider from '@src/tests/larascript/providers/TestAuthProvider';
import TestConsoleProvider from '@src/tests/larascript/providers/TestConsoleProvider';
import TestCryptoProvider from '@src/tests/larascript/providers/TestCryptoProvider';
import TestDatabaseProvider from '@src/tests/larascript/providers/TestDatabaseProvider';
import TestMigrationProvider from '@src/tests/larascript/providers/TestMigrationProvider';
import { DataTypes } from 'sequelize';

// Create test model attributes interface
interface TestModelAttributes extends IModelAttributes {
    name?: string;
}

// Create test model class
class TestModel extends Model<TestModelAttributes> {

    public table = 'test_models';

    public fields = ['name'];

}

// Create event classes for each lifecycle event
class TestModelCreatingEvent extends BaseEvent<TestModelAttributes> {

    protected namespace: string = 'testing';

    async execute() {
        expect(this.getPayload().name).toBe('test');
    }

}

class TestModelCreatedEvent extends BaseEvent<TestModelAttributes> {

    protected namespace: string = 'testing';

    async execute() {
        expect(this.getPayload().name).toBe('test');
        expect(this.getPayload().id).toBeDefined();
    }

}

class TestModelUpdatingEvent extends BaseEvent<TestModelAttributes> {

    protected namespace: string = 'testing';

    async execute() {
        expect(this.getPayload().name).toBe('updated');
    }

}

class TestModelUpdatedEvent extends BaseEvent<TestModelAttributes> {

    protected namespace: string = 'testing';

    async execute() {
        expect(this.getPayload().name).toBe('updated');
    }

}

class TestModelDeletingEvent extends BaseEvent<TestModelAttributes> {

    protected namespace: string = 'testing';

    async execute() {
        expect(this.getPayload().name).toBe('to delete');
    }

}

class TestModelDeletedEvent extends BaseEvent<TestModelAttributes> {

    protected namespace: string = 'testing';

    async execute() {
        expect(this.getPayload().name).toEqual('to delete');
    }

}

class TestModelModifyCreatingEvent extends BaseEvent<TestModelAttributes> {

    protected namespace: string = 'testing';

    async execute() {
        const attributes = this.getPayload();
        attributes.name = 'modified during creating';
        this.setPayload(attributes);
    }
 
}

class TestModelModifyUpdatingEvent extends BaseEvent<TestModelAttributes> {

    protected namespace: string = 'testing';

    async execute() {
        const attributes = this.getPayload();
        attributes.name = 'modified during updating';
        this.setPayload(attributes);
    }

}

class TestEventLifeCycleProvider extends EventProvider {

    protected config: IEventConfig = {
        defaultDriver: SyncDriver,
        drivers: {
            [EVENT_DRIVERS.SYNC]: EventService.createConfigDriver(SyncDriver, {}),
        },
        listeners: []
    }

}

EventRegistry.registerMany([
    TestModelCreatingEvent,
    TestModelCreatedEvent,
    TestModelUpdatingEvent,
    TestModelUpdatedEvent,
    TestModelDeletingEvent,
    TestModelDeletedEvent,
    TestModelModifyCreatingEvent,
    TestModelModifyUpdatingEvent
])

describe('model lifecycle events', () => {
    beforeAll(async () => {

        const config: KernelConfig = {
            environment: EnvironmentTesting,
            providers: [
                new LoggerProvider(),
                new TestConsoleProvider(),
                new TestDatabaseProvider(),
                new EloquentQueryProvider(),
                new TestEventLifeCycleProvider(),
                new TestAuthProvider(),
                new TestMigrationProvider(),
                new ValidatorProvider(),
                new TestCryptoProvider()
            ]
        }
        await Kernel.boot(config, {});
    });

    beforeEach(async () => {
        // Create test table
        const schema = app('db').schema();
        await schema.createTable('test_models', {
            name: DataTypes.STRING,
            createdAt: DataTypes.DATE,
            updatedAt: DataTypes.DATE
        });

        // Reset mock events
        app('events').resetMockEvents();
    });

    afterEach(async () => {
        // Drop test table
        await app('db').schema().dropTable('test_models');

        // Reset mock events
        app('events').resetMockEvents();
    });

    test('creating and created events are emitted when saving new model', async () => {
        const eventService = app('events');
        const model = TestModel.create({ name: 'test' });

        // Mock the events
        eventService.mockEvent(TestModelCreatingEvent);
        eventService.mockEvent(TestModelCreatedEvent);

        model.on('creating', TestModelCreatingEvent);
        model.on('created', TestModelCreatedEvent);

        await model.save();

        expect(eventService.assertDispatched(TestModelCreatingEvent)).toBeTruthy();
        expect(eventService.assertDispatched(TestModelCreatedEvent)).toBeTruthy();
    });

    test('updating and updated events are emitted when updating model', async () => {
        const eventService = app('events');
        const model = TestModel.create({ name: 'original' });
        await model.save();

        // Mock the events
        eventService.mockEvent(TestModelUpdatingEvent);
        eventService.mockEvent(TestModelUpdatedEvent);

        model.on('updating', TestModelUpdatingEvent);
        model.on('updated', TestModelUpdatedEvent);

        await model.attr('name', 'updated');
        await model.save();

        expect(eventService.assertDispatched(TestModelUpdatingEvent)).toBeTruthy();
        expect(eventService.assertDispatched(TestModelUpdatedEvent)).toBeTruthy();
    });

    test('deleting and deleted events are emitted when deleting model', async () => {
        const eventService = app('events');
        const model = TestModel.create({ name: 'to delete' });
        await model.save();

        // Mock the events
        eventService.mockEvent(TestModelDeletingEvent);
        eventService.mockEvent(TestModelDeletedEvent);

        model.on('deleting', TestModelDeletingEvent);
        model.on('deleted', TestModelDeletedEvent);

        await model.delete();

        expect(eventService.assertDispatched(TestModelDeletingEvent)).toBeTruthy();
        expect(eventService.assertDispatched(TestModelDeletedEvent)).toBeTruthy();
    });

    test('events can modify attributes during lifecycle', async () => {
        const eventService = app('events');
        const model = TestModel.create({ name: 'original' });

        // Mock the events
        eventService.mockEvent(TestModelModifyCreatingEvent);
        eventService.mockEvent(TestModelModifyUpdatingEvent);

        model.on('creating', TestModelModifyCreatingEvent);
        await model.save();
        expect(await model.attr('name')).toBe('modified during creating');

        model.on('updating', TestModelModifyUpdatingEvent);
        await model.attr('name', 'should be modified');
        await model.save();

        expect(await model.attr('name')).toBe('modified during updating');
    });

    test('events can be removed using off()', async () => {
        const eventService = app('events');
        const model = TestModel.create({ name: 'test' });

        // Mock the event
        eventService.mockEvent(TestModelCreatingEvent);

        model.on('creating', TestModelCreatingEvent);
        model.off('creating');
        await model.save();

        expect(() => eventService.assertDispatched(TestModelCreatingEvent)).toThrow(EventNotDispatchedException);
    });
}); 