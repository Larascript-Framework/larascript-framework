import { EVENT_DRIVERS } from "../consts/drivers.js";
import { BaseEventSubscriber } from "./BaseEventSubciber.js";

export abstract class BaseSyncSubscriber<TPayload = unknown> extends BaseEventSubscriber<TPayload> {
    driverName: keyof typeof EVENT_DRIVERS = EVENT_DRIVERS.SYNC as keyof typeof EVENT_DRIVERS;
}