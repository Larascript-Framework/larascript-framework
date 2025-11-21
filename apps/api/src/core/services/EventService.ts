 
import { app } from "@/core/services/App.js";
import { IBaseEvent } from "@larascript-framework/larascript-events";

export const events = () => app('events');

export const dispatch = (event: IBaseEvent) => events().dispatch(event);
