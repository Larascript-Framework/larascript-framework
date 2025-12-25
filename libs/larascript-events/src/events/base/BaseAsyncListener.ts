import { EVENT_DRIVERS } from "../consts/drivers.js";
import { BaseEventListener } from "./BaseEventListener.js";

export abstract class BaseAsyncListener<TPayload = unknown> extends BaseEventListener<TPayload> {
    driverName: keyof typeof EVENT_DRIVERS = EVENT_DRIVERS.QUEABLE as keyof typeof EVENT_DRIVERS;
}