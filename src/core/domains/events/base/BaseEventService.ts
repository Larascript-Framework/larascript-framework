/* eslint-disable no-unused-vars */
import { compose } from "@ben-shepherd/larascript-utils";
import HasSimpleRegisterConcern from "@src/core/concerns/HasSimpleRegisterConcern";
import EventMockableConcern from "@src/core/domains/events/concerns/EventMockableConcern";
import EventWorkerConcern from "@src/core/domains/events/concerns/EventWorkerConcern";
import { IEventConfig } from "@src/core/domains/events/interfaces/config/IEventConfig";
import { IBaseEvent } from "@src/core/domains/events/interfaces/IBaseEvent";
import { TEventWorkerOptions } from "@src/core/domains/events/interfaces/IEventWorkerConcern";
import { TMockableEventCallback } from "@src/core/domains/events/interfaces/IMockableConcern";
import { TClassConstructor } from "@src/core/interfaces/ClassConstructor.t";
import { ICommandOptionArguement, IOptionTypes } from "@src/core/interfaces/concerns/ISimpleRegister";


class BaseEventService extends compose(class {}, HasSimpleRegisterConcern, EventWorkerConcern, EventMockableConcern) {

    static readonly REGISTERED_EVENTS = "registeredEvents";

    static readonly REGISTERED_DRIVERS = "registeredDrivers";

    static readonly REGISTERED_LISTENERS = "registeredListeners"; 

    static readonly REGISTERED_MOCK_EVENTS = "mockEvents";

    static readonly REGISTERED_MOCK_DISPATCHED = "mockDispatched";

    protected config!: IEventConfig;
    
    /**
     * Declare simple register concern 
     */
    declare srCreateList: (listName: string, listValue?: IOptionTypes['listValue']) => void;

    declare srListExists: (listName: string) => boolean;

    declare srUpdateList: (listName: string, listValue: IOptionTypes['listValue']) => void;

    declare srGetList: (listName: string) => IOptionTypes['listValue'];

    declare srClearList: (listName: string) => void;

    declare srDeleteList: (listName: string) => void;

    declare srSetValue: (key: string, value: unknown, listName: string) => void;

    declare srHasValue: (key: string, listName: string) => boolean;

    declare srGetValue: (key: string, listName: string) => unknown;

    declare srCommand: <K extends keyof ICommandOptionArguement = keyof ICommandOptionArguement>(command: K, options?: ICommandOptionArguement[K]['options']) => ICommandOptionArguement[K]['returns'];

    /**
     * Declare EventMockableConcern methods.
     */
    declare mockEvent: (event: TClassConstructor<IBaseEvent>) => void;

    declare mockEventDispatched: (event: IBaseEvent) => void;

    declare resetMockEvents: () => void;

    declare assertDispatched: <TPayload = unknown>(eventCtor: TClassConstructor<IBaseEvent>, callback?: TMockableEventCallback<TPayload>) => boolean

    /**
     * Delcare EventWorkerConcern methods.
     */
    declare runWorker: (options: TEventWorkerOptions) => Promise<void>;

}

export default BaseEventService