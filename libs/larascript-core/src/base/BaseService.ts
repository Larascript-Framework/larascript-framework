/* eslint-disable @typescript-eslint/no-explicit-any */

import { IService } from "@larascript-framework/contracts/larascript-core";

/**
 * Service base class
 *
 * @abstract
 * @class Service
 * @implements {IService}
 */
export abstract class BaseService<Config = any> implements IService {
  /**
   * Service configuration
   *
   * @protected
   * @type {Config|null}
   */
  protected config!: Config | null;

  /**
   * Creates an instance of Service
   *
   * @constructor
   * @param {Config|null} [config=null] - Service configuration
   */
  constructor(config: Config | null = null) {
    this.config = config;
  }

  /**
   * Returns service configuration
   *
   * @returns {Config|null} - Service configuration
   */
  public getConfig(): Config | null {
    return this.config;
  }
}
