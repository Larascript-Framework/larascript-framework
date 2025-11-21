import { EventDriverConstructor, IEventDriversConfigOption } from "../interfaces/driver.t.js"

export class EventConfig 
{
        /**
     * Retrieves the name of the event driver from its constructor.
     * @param driver The constructor of the event driver.
     * @returns The name of the event driver as a string.
     */
        public static getDriverName(driver: EventDriverConstructor): string {
            return driver.name
        }
    
        /**
         * @param driverCtor The event driver class.
         * @param options The event driver options.
         * @returns The event driver config.
         */
        public static createConfigDriver<T extends IEventDriversConfigOption['options'] = {}>(driverCtor: EventDriverConstructor, options?: T): IEventDriversConfigOption {
            return {
                driver: driverCtor,
                options
            }
        }
}