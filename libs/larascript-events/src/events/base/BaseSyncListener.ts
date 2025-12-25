import { EVENT_DRIVERS } from "../consts/drivers.js";
import BaseEventListener from "./BaseEventListener.js";

export abstract class BaseSyncListener<TPayload = unknown> extends BaseEventListener<TPayload> {
    driverName: keyof typeof EVENT_DRIVERS = EVENT_DRIVERS.SYNC as keyof typeof EVENT_DRIVERS;
}