/* eslint-disable @typescript-eslint/no-explicit-any */
import { IObserver, IObserverEvent } from "./IObserver.js";

/**
 * Abstract class implementing the Observer pattern.
 * Classes extending this class will have event handlers for the following events:
 * - creating
 * - created
 * - updating
 * - updated
 * - saving
 * - saved
 * - deleting
 * - deleted
 *
 * These event handlers can be overridden to provide custom logic for handling these events.
 *
 * Additionally, the class provides methods for handling custom events that are not part of the predefined set.
 */
export abstract class Observer<Attributes extends object>
  implements IObserver<Attributes>
{
  /**
   * Called when a 'creating' event is triggered.
   *
   * @param data - The data associated with the event
   * @returns The processed data, or the original data if no handler is found
   */
  async creating(data: Attributes): Promise<Attributes> {
    return data;
  }

  /**
   * Called when a 'created' event is triggered.
   *
   * @param data - The data associated with the event
   * @returns The processed data, or the original data if no handler is found
   */
  async created(data: Attributes): Promise<Attributes> {
    return data;
  }

  /**
   * Called when an 'updating' event is triggered.
   *
   * @param data - The data associated with the event
   * @returns The processed data, or the original data if no handler is found
   */
  async updating(data: Attributes): Promise<Attributes> {
    return data;
  }

  /**
   * Called when an 'updated' event is triggered.
   *
   * @param data - The data associated with the event
   * @returns The processed data, or the original data if no handler is found
   */
  async updated(data: Attributes): Promise<Attributes> {
    return data;
  }

  /**
   * Called when a 'saving' event is triggered.
   *
   * @param data - The data associated with the event
   * @returns The processed data, or the original data if no handler is found
   */
  async saving(data: Attributes): Promise<Attributes> {
    return data;
  }

  /**
   * Called when a 'saved' event is triggered.
   *
   * @param data - The data associated with the event
   * @returns The processed data, or the original data if no handler is found
   */
  async saved(data: Attributes): Promise<Attributes> {
    return data;
  }

  /**
   * Called when a 'deleting' event is triggered.
   *
   * @param data - The data associated with the event
   * @returns The processed data, or the original data if no handler is found
   */
  async deleting(data: Attributes): Promise<Attributes> {
    return data;
  }

  /**
   * Called when a 'deleted' event is triggered.
   *
   * @param data - The data associated with the event
   * @returns The processed data, or the original data if no handler is found
   */
  async deleted(data: Attributes): Promise<Attributes> {
    return data;
  }

  /**
   * Handles predefined observer events.
   * This method is called when a known event occurs and routes the data
   * through the appropriate event handler method.
   *
   * @param name - The name of the event to handle (must be a key of IObserver)
   * @param data - The data associated with the event
   * @returns The processed data, or the original data if no handler is found
   *
   * @example
   * // Inside some method of a class extending Observer
   * this.data = this.on('updating', this.data);
   */
  async on(name: IObserverEvent, data: Attributes): Promise<Attributes> {
    if (this[name] && typeof this[name] === "function") {
      // Call the method associated with the event name

      return await (
        this[name] as (data: Attributes, ...args: any[]) => Attributes
      )(data);
    }
    // If no method is found or it's not a function, return the original data
    return data;
  }

  /**
   * Handles custom observer events that are not part of the predefined set.
   * This method allows for extension of the observer pattern with custom events.
   *
   * @param customName - The name of the custom event to handle
   * @param data - The data associated with the custom event
   * @returns The processed data, or the original data if no handler is found
   *
   * @example
   * // Inside some method of a class extending Observer
   * this.data = this.onCustom('onPasswordChange', this.data, optionalParameter);
   */
  async onCustom(
    customName: string,
    data: Attributes,
    ...args: any[]
  ): Promise<Attributes> {
    // Attempt to find a method on this instance with the given custom name

    const method = this[customName as keyof this] as
      | ((data: Attributes, ...args: any[]) => Attributes)
      | undefined;

    if (method && typeof method === "function") {
      // If a matching method is found and it's a function, call it
      return method.apply(this, [data, ...args]);
    }

    // If no matching method is found, return the original data unchanged
    return data;
  }
}
